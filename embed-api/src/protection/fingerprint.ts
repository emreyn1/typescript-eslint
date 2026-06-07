// Fingerprint + anti-debug client scripts injected into `player-v2.html`.
//
// These are the existing protection primitives (reconstructed into the `src/`
// tree from the compiled `dist/protection/fingerprint.js` stopgap). The route
// string-replaces the `{{FINGERPRINT_SCRIPT}}` / `{{ANTIDEBUG_SCRIPT}}`
// placeholders in the player template with these blocks (Req 4.7).
//
// The fingerprint script persists a `_fp` cookie that the `/stream` proxy reads
// as the "passing fingerprint / anti-debug signal" half of the stream gate
// (Req 13.3; see `routes/stream.ts#hasPassingFingerprint`).

/** Computes a lightweight device fingerprint and stores it in the `_fp` cookie. */
export const fingerprintScript = `
<script>
(function(){
  var c=document.createElement('canvas'),g=c.getContext('2d');
  if(!g)return;
  g.textBaseline='top';
  g.font='14px Arial';
  g.fillText('fp-check',2,2);
  var d=c.toDataURL();

  var gl=document.createElement('canvas').getContext('webgl');
  var r=gl?gl.getParameter(gl.RENDERER):'none';
  var v=gl?gl.getParameter(gl.VENDOR):'none';

  var tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'unknown';
  var lang=navigator.language||'en';
  var cores=navigator.hardwareConcurrency||0;
  var mem=navigator.deviceMemory||0;
  var touch='ontouchstart' in window?1:0;

  var raw=d+r+v+tz+lang+cores+mem+touch+screen.width+screen.height;
  var hash=0;
  for(var i=0;i<raw.length;i++){
    hash=((hash<<5)-hash)+raw.charCodeAt(i);
    hash|=0;
  }

  window.__fp=Math.abs(hash).toString(36);
  document.cookie='_fp='+window.__fp+';path=/;max-age=86400;SameSite=Strict';
})();
</script>`;

/** Frustrates devtools/debugger inspection of the player. */
export const antiDebugScript = `
<script>
(function(){
  var t=Date.now();
  debugger;
  if(Date.now()-t>100){
    document.body.innerHTML='';
    window.location='about:blank';
  }

  setInterval(function(){
    var s=Date.now();
    debugger;
    if(Date.now()-s>100){
      document.body.innerHTML='';
    }
  },3000);

  var k=['F12','F8'];
  document.addEventListener('keydown',function(e){
    if(k.indexOf(e.key)!==-1||(e.ctrlKey&&e.shiftKey&&(e.key==='I'||e.key==='J'||e.key==='C'))){
      e.preventDefault();
      return false;
    }
  });
  document.addEventListener('contextmenu',function(e){e.preventDefault()});
})();
</script>`;
