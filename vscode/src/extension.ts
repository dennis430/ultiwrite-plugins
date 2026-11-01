import * as vscode from 'vscode';
import { AuthController } from './auth';
import { JsonObject, MCP_URL, ORIGIN, ServiceClient, ServiceError, safeServiceUrl, selectFiles } from './service';

interface CaseChoice extends vscode.QuickPickItem { caseId?: string; reportId?: string; }
interface Row { label: string; command?: string; detail?: string; icon?: string; }

class Home implements vscode.TreeDataProvider<Row> {
  private readonly changes = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this.changes.event;
  account = 'Connect your Ultiwrite account';
  status = 'Select files to start an investigation';
  refresh(): void { this.changes.fire(); }
  getTreeItem(row: Row): vscode.TreeItem {
    const item = new vscode.TreeItem(row.label);
    item.description = row.detail;
    if (row.icon) item.iconPath = new vscode.ThemeIcon(row.icon);
    if (row.command) item.command = { command: row.command, title: row.label };
    return item;
  }
  getChildren(): Row[] {
    return [
      { label: this.account, command: 'ultiwrite.account', icon: 'account' },
      { label: this.status, command: 'ultiwrite.checkStatus', icon: 'pulse' },
      { label: 'Connect / Reconnect', command: 'ultiwrite.reconnect', icon: 'plug' },
      { label: 'Connect another account', command: 'ultiwrite.switchAccount', icon: 'account' },
      { label: 'Analyze selected files', command: 'ultiwrite.analyzeFiles', icon: 'cloud-upload' },
      { label: 'Cases and reports', command: 'ultiwrite.listCases', icon: 'list-selection' },
      { label: 'Open saved report', command: 'ultiwrite.openReport', icon: 'file-text' },
      { label: 'Account and permissions', command: 'ultiwrite.account', icon: 'shield' },
      { label: 'Open dashboard', command: 'ultiwrite.dashboard', icon: 'link-external' },
      { label: 'Disconnect', command: 'ultiwrite.disconnect', icon: 'sign-out' },
    ];
  }
  dispose(): void { this.changes.dispose(); }
}

function cancellation(token: vscode.CancellationToken): { signal: AbortSignal; dispose(): void } {
  const controller = new AbortController();
  const listener = token.onCancellationRequested(() => controller.abort());
  if (token.isCancellationRequested) controller.abort();
  return { signal: controller.signal, dispose: () => listener.dispose() };
}

function caseChoices(payload: JsonObject): CaseChoice[] {
  const cases = Array.isArray(payload.cases) ? payload.cases : [];
  const reports = Array.isArray(payload.reports) ? payload.reports : [];
  return [
    ...cases.map((value: JsonObject) => ({ label: String(value.title ?? value.name ?? value.caseId ?? value.id ?? 'Investigation'), description: String(value.workflowStatus ?? value.status ?? ''), caseId: value.caseId ?? value.id, reportId: value.linkedReportId ?? value.reportId })),
    ...reports.map((value: JsonObject) => ({ label: String(value.title ?? value.name ?? value.reportId ?? value.id ?? 'Saved report'), description: 'Saved report', caseId: undefined, reportId: value.reportId ?? value.id })),
  ].filter(value => typeof value.caseId === 'string' || typeof value.reportId === 'string');
}

function reportLinks(payload: JsonObject): { label: string; url: string }[] {
  const found: { label: string; url: string }[] = [];
  const visit = (value: unknown, path: string, depth: number) => {
    if (depth > 4) return;
    if (typeof value === 'string' && /^https:\/\//.test(value)) {
      try {
        const url = safeServiceUrl(value);
        if (url.pathname.startsWith('/api/integrations/ultiwrite/upload')) return;
        if (!found.some(link => link.url === url.href)) found.push({ label: path.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[._]/g, ' ') || 'Open report', url: url.href });
      } catch { /* Only service-owned report and sign-in links are offered. */ }
    } else if (value && typeof value === 'object') for (const [key, entry] of Object.entries(value)) visit(entry, path ? `${path}.${key}` : key, depth + 1);
  };
  // The export contract's inline report may contain evidence URLs. Only its delivery fields are links to open.
  visit(payload.website, 'Website', 0);
  visit(payload.downloads, 'Download', 0);
  return found;
}

export function activate(context: vscode.ExtensionContext): { providerId: string } {
  if (!vscode.workspace.isTrusted) return { providerId: 'ultiwrite.mcp' };
  const home = new Home();
  const providerChanges = new vscode.EventEmitter<void>();
  let latest: CaseChoice | undefined;
  let busy = false;
  let accountLabel: string | undefined;
  let identityGeneration = 0;
  let authUpdates = 0;
  const auth = new AuthController(context.secrets, url => vscode.env.openExternal(vscode.Uri.parse(url)), () => {
    const update = ++authUpdates;
    providerChanges.fire();
    void auth.saved().then(session => { if (update !== authUpdates) return; void vscode.commands.executeCommand('setContext', 'ultiwrite.connected', !!session); if (!session) { accountLabel = undefined; latest = undefined; home.account = 'Connect your Ultiwrite account'; home.status = 'Select files to start an investigation'; } home.refresh(); }).catch(() => {});
  });
  const api = new ServiceClient((signal, refresh) => auth.token(signal, refresh));
  const provider: vscode.McpServerDefinitionProvider<vscode.McpHttpServerDefinition> = {
    onDidChangeMcpServerDefinitions: providerChanges.event,
    provideMcpServerDefinitions: async () => {
      const session = await auth.saved();
      // Reading SecretStorage is noninteractive. Changes to these in-memory headers let VS Code refresh a rotated grant.
      return [new vscode.McpHttpServerDefinition('Ultiwrite', vscode.Uri.parse(MCP_URL), session && session.expiresAt > Date.now() ? { Authorization: `Bearer ${session.accessToken}` } : {}, '0.1.0')];
    },
    resolveMcpServerDefinition: async (server, token) => {
      const active = cancellation(token);
      try { server.headers = { Authorization: `Bearer ${await auth.token(active.signal)}` }; return server; } finally { active.dispose(); }
    },
  };
  context.subscriptions.push(auth, home, providerChanges, vscode.lm.registerMcpServerDefinitionProvider('ultiwrite.mcp', provider), vscode.window.registerTreeDataProvider('ultiwrite.home', home));
  void auth.resume().then(async () => { const session = await auth.saved(); void vscode.commands.executeCommand('setContext', 'ultiwrite.connected', !!session); if (session) { home.account = 'Connected — check account'; home.refresh(); } }).catch(() => {});

  const noticeError = async (error: unknown) => {
    const text = error instanceof ServiceError ? error.message : error instanceof Error && ['AbortError', 'TimeoutError'].includes(error.name)
      ? 'The request was cancelled or timed out. Check recent cases before submitting the same files again.'
      : 'Ultiwrite could not complete the request. Check your connection and recent cases before retrying.';
    const choice = await vscode.window.showErrorMessage(text, 'Reconnect', 'Open dashboard');
    if (choice === 'Reconnect') void vscode.commands.executeCommand('ultiwrite.reconnect');
    if (choice === 'Open dashboard') void vscode.env.openExternal(vscode.Uri.parse(ORIGIN + '/dashboard'));
  };
  const command = (id: string, callback: (...args: any[]) => Promise<unknown>) => context.subscriptions.push(vscode.commands.registerCommand(id, async (...args: any[]) => {
    if (!vscode.workspace.isTrusted) { await vscode.window.showWarningMessage('Trust this workspace before using Ultiwrite.'); return; }
    try { return await callback(...args); } catch (error) { await noticeError(error); }
  }));
  const progress = <T>(title: string, work: (signal: AbortSignal, progress: vscode.Progress<{ message?: string; increment?: number }>) => Promise<T>) => vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title, cancellable: true }, async (ui, token) => {
    const active = cancellation(token);
    try { return await work(active.signal, ui); } finally { active.dispose(); }
  });
  const identify = async (signal?: AbortSignal) => {
    const generation = identityGeneration;
    const value = await api.call('ultiwrite_account_get', {}, signal);
    if (generation !== identityGeneration) throw new ServiceError('The account changed while its identity was being checked. Check the current account again.');
    const account = value.account ?? value;
    accountLabel = typeof account.email === 'string' ? account.email : typeof account.accountId === 'string' ? `Account ${account.accountId}` : 'Authorized Ultiwrite account';
    home.account = accountLabel!;
    home.refresh();
    return value;
  };
  const connect = async (replace: boolean, switchAccount = false) => {
    if (busy) { await vscode.window.showInformationMessage('Wait for the current file transfer to finish before changing accounts.'); return; }
    if (switchAccount) {
      const selected = await vscode.window.showInformationMessage('The browser will open Ultiwrite consent. Choose “Use a different account” there to select another account. This replaces the extension’s current connection.', { modal: true }, 'Continue');
      if (!selected) return;
    }
    if (replace) { identityGeneration++; api.reset(); latest = undefined; accountLabel = undefined; await auth.disconnect(); }
    await progress('Connect Ultiwrite', async signal => { await auth.token(signal); await identify(signal); });
    await vscode.window.showInformationMessage(`Connected to ${accountLabel}. Ultiwrite tools are available to Copilot after approving its server trust prompt.`);
  };
  command('ultiwrite.connect', () => connect(false));
  command('ultiwrite.reconnect', () => connect(true));
  command('ultiwrite.switchAccount', () => connect(true, true));
  command('ultiwrite.disconnect', async () => {
    if (busy) { await vscode.window.showInformationMessage('Cancel or finish the current upload before disconnecting.'); return; }
    identityGeneration++; api.reset(); latest = undefined; accountLabel = undefined; await auth.disconnect();
    await vscode.window.showInformationMessage('Ultiwrite credentials were removed from this VS Code profile. Server revocation was attempted.');
  });
  command('ultiwrite.dashboard', async () => vscode.env.openExternal(vscode.Uri.parse(ORIGIN + '/dashboard')));
  command('ultiwrite.help', async () => vscode.env.openExternal(vscode.Uri.parse(ORIGIN + '/docs/mcp')));

  command('ultiwrite.account', async () => {
    await progress('Check Ultiwrite account', signal => identify(signal));
    const session = await auth.saved();
    const selected = await vscode.window.showInformationMessage(`Connected: ${accountLabel}\nGranted permissions: ${(session?.scopes ?? []).join(', ') || 'none'}\nRead accesses your cases and saved reports. Evidence permission uploads selected files and starts investigations under your account allowance.`, { modal: true }, 'Open dashboard');
    if (selected) await vscode.env.openExternal(vscode.Uri.parse(ORIGIN + '/dashboard'));
  });

  const browse = async (onlyReports = false): Promise<CaseChoice | undefined> => {
    let cursor: string | undefined;
    const choices: CaseChoice[] = [];
    for (;;) {
      const page = await progress('Load Ultiwrite cases', signal => api.call('ultiwrite_cases_list', { limit: 20, ...(cursor ? { cursor } : {}) }, signal));
      choices.push(...caseChoices(page));
      const available = choices.filter(value => !onlyReports || value.reportId || value.caseId);
      const more: CaseChoice = { label: '$(more) Load more', description: 'Retrieve the next page' };
      const selected = await vscode.window.showQuickPick(page.nextCursor ? [...available, more] : available, { title: 'Ultiwrite cases and reports', placeHolder: available.length ? 'Choose an investigation or saved report' : 'No cases or reports were returned for this account' });
      if (!selected || selected !== more) return selected;
      if (typeof page.nextCursor !== 'string' || page.nextCursor === cursor) throw new ServiceError('The service returned an invalid page continuation.');
      cursor = page.nextCursor;
    }
  };

  const showReport = async (choice?: CaseChoice): Promise<void> => {
    choice ??= latest ?? await browse(true);
    if (!choice) return;
    let reportId = choice.reportId;
    if (!reportId && choice.caseId) {
      const status = await progress('Check report availability', signal => api.call('ultiwrite_case_status', { caseId: choice!.caseId }, signal));
      reportId = status.linkedReportId ?? status.reportId;
    }
    if (!reportId) { await vscode.window.showInformationMessage('This case does not yet have a saved report. Check its analysis status.'); return; }
    const exported = await progress('Load report links', signal => api.call('ultiwrite_report_export', { reportId }, signal));
    const links = reportLinks(exported);
    if (!links.length) { await vscode.window.showInformationMessage('No usable report links were returned. Open your dashboard to check the saved report.'); return; }
    const selected = await vscode.window.showQuickPick(links, { title: 'Open an Ultiwrite report', placeHolder: 'Your browser must be signed in to the same Ultiwrite account' });
    if (selected) await vscode.env.openExternal(vscode.Uri.parse(selected.url));
  };

  const status = async (choice?: CaseChoice): Promise<void> => {
    choice ??= latest ?? await browse();
    if (!choice) return;
    if (!choice.caseId) return showReport(choice);
    latest = choice;
    const value = await progress('Check Ultiwrite analysis', signal => api.call('ultiwrite_case_status', { caseId: choice!.caseId }, signal));
    const state = String(value.workflowStatus ?? value.status ?? 'Status returned');
    const reportId = value.linkedReportId ?? value.reportId;
    if (typeof reportId === 'string') latest = { ...choice, reportId };
    home.status = `Analysis: ${state}`;
    home.refresh();
    const canContinue = value.continuation?.tool === 'ultiwrite_evidence_submit' && value.continuation?.caseId === choice.caseId;
    const options = reportId ? ['Open report'] : canContinue ? ['Continue analysis'] : ['Open dashboard'];
    const selected = await vscode.window.showInformationMessage(`Ultiwrite: ${state}. ${reportId ? 'A saved report is available.' : 'A completed report has not been confirmed.'}`, ...options);
    if (selected === 'Open report') await showReport(latest);
    if (selected === 'Open dashboard') await vscode.env.openExternal(vscode.Uri.parse(ORIGIN + '/dashboard'));
    if (selected === 'Continue analysis') {
      const advanced = await progress('Continue the existing investigation', signal => api.call('ultiwrite_evidence_submit', { caseId: choice!.caseId }, signal));
      home.status = `Analysis: ${String(advanced.workflowStatus ?? advanced.status ?? 'continuation requested')}`;
      home.refresh();
      await vscode.window.showInformationMessage('The existing investigation was continued. Use Check Analysis Status for the next update.');
    }
  };
  command('ultiwrite.listCases', async () => { const selected = await browse(); if (selected) { latest = selected; await status(selected); } });
  command('ultiwrite.checkStatus', () => status());
  command('ultiwrite.openReport', () => showReport());

  const follow = async (caseId: string): Promise<void> => {
    const result = await progress('Ultiwrite is analyzing your evidence — cancel stops client requests', (signal, ui) =>
      api.followCase(caseId, state => { home.status = `Analysis: ${state}`; home.refresh(); ui.report({ message: state }); }, signal));
    if (result?.linkedReportId) {
      latest = { label: 'Latest investigation', caseId, reportId: result.linkedReportId };
      const action = await vscode.window.showInformationMessage('Ultiwrite has linked the completed investigation to its saved report.', 'Open report');
      if (action) await showReport(latest);
    } else await vscode.window.showInformationMessage('The investigation remains available in Cases and Reports. Check its status for the next action; no completed report is assumed.');
  };

  command('ultiwrite.analyzeFiles', async (uri?: vscode.Uri, selection?: vscode.Uri[]) => {
    if (busy) { await vscode.window.showInformationMessage('An upload is already in progress.'); return; }
    busy = true;
    try {
    const selected = selection?.length ? selection : uri ? [uri] : await vscode.window.showOpenDialog({ canSelectFiles: true, canSelectFolders: false, canSelectMany: true, title: 'Choose the files to share with Ultiwrite', openLabel: 'Choose evidence' });
    if (!selected?.length) return;
    if (selected.some(value => value.scheme !== 'file')) throw new ServiceError('Select files on this computer. For remote workspace files, use the authenticated upload page in your dashboard.');
    const files = await selectFiles(selected.map(value => value.fsPath));
    await progress('Check Ultiwrite access', signal => identify(signal));
    const option = await vscode.window.showQuickPick([
      { label: 'Include Document Forensics', description: 'Request it under the account’s applicable entitlement', value: true },
      { label: 'Skip optional Document Forensics', description: 'Standard parsing, metadata and coherence still apply', value: false },
    ], { title: 'Document Forensics', placeHolder: 'Choose how to handle the optional examination' });
    if (!option) return;
    const megabytes = files.reduce((total, file) => total + file.size, 0) / 1024 / 1024;
    const consent = await vscode.window.showInformationMessage(`Upload ${files.length} selected file${files.length === 1 ? '' : 's'} (${megabytes.toFixed(1)} MiB) to ${accountLabel} and start an investigation? Your account’s existing allowance and permissions apply. Only these selected files will be transferred. Confirm you are authorized to share them.`, { modal: true, detail: files.slice(0, 8).map(file => file.name).join('\n') + (files.length > 8 ? `\n…and ${files.length - 8} more selected files` : '') }, 'Upload and analyze');
    if (!consent) return;
      const result = await progress('Upload evidence to Ultiwrite', (signal, ui) => api.upload(files, option.value, message => ui.report({ message }), signal));
      const caseId = result.caseId ?? result.case?.id;
      if (typeof caseId !== 'string') throw new ServiceError('The service accepted the upload but did not return a case ID. Check your recent cases before submitting these files again.');
      latest = { label: 'Latest investigation', caseId, reportId: result.linkedReportId ?? result.reportId };
      home.status = `Analysis: ${String(result.status ?? result.state ?? 'submitted')}`;
      home.refresh();
      // The upload finalizer can return processing without its continuation. Ask status and advance only its returned case.
      await follow(caseId);
    } finally { busy = false; }
  });
  return { providerId: 'ultiwrite.mcp' };
}

export function deactivate(): void { /* All resources are owned by the extension context. */ }
