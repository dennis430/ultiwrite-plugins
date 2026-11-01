<?php
// Function-level checks with tiny WordPress stubs; not a native WordPress install.
define('ABSPATH', __DIR__);function add_action(...$args) {};
require __DIR__ . '/../adapters/wordpress/ultiwrite.php';
function check($ok,$name){if(!$ok){fwrite(STDERR,"FAIL $name\n");exit(1);}echo "PASS $name\n";}
check(ultiwrite_route('account')['path']==='/me','account route');
check(ultiwrite_route('upload')['method']==='POST','upload is explicit POST');
check(ultiwrite_route('brief','case_123')['path']==='/cases/case_123/brief','brief route');
foreach (['../me','x?tenant=other','https://evil.example'] as $bad){$failed=false;try{ultiwrite_route('brief',$bad);}catch(InvalidArgumentException $e){$failed=true;}check($failed,'hostile id refused');}
check(ultiwrite_safe_url('https://dwsoffshorepartners.com/dashboard')!==null,'canonical link');
foreach(['https://evil.example','http://dwsoffshorepartners.com','https://user:pass@dwsoffshorepartners.com','https://dwsoffshorepartners.com:8443'] as $bad)check(ultiwrite_safe_url($bad)===null,'unsafe URL refused');
echo "11 function checks passed; native host acceptance NOT_RUN\n";
