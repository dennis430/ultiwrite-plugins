import { discovery, main } from './lib.mjs';
main(async () => {
  const contract = await discovery();
  console.log(JSON.stringify(contract, null, 2));
  console.log('Read-only discovery passed. This does not verify the Microsoft callback allowlist, user sign-in, or tenant installation.');
});
