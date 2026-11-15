/* Install controls; route data is never stored in the service-worker cache. */
(async () => {
  if (window.NightSweepAndroid || !('serviceWorker' in navigator)) return;
  const config = JSON.parse(document.getElementById('carpe-pwa-config').textContent);
  const panel = document.createElement('details');
  panel.className = 'offline-controls';
  panel.style.cssText = 'margin:20px auto;padding:12px 20px;max-width:1200px;color:inherit;font:14px system-ui';
  panel.innerHTML = '<summary>Offline & installation</summary><p role="status">Preparing offline copy…</p><button type="button" data-install hidden>Install app</button> <button type="button" data-update hidden>Install update</button> <a href="guide.html">App guide</a>';
  document.body.append(panel);
  const status = panel.querySelector('[role=status]');
  let installEvent;
  window.addEventListener('beforeinstallprompt', event => {event.preventDefault();installEvent=event;panel.querySelector('[data-install]').hidden=false;});
  panel.querySelector('[data-install]').onclick=async()=>{if(installEvent){await installEvent.prompt();installEvent=null;panel.querySelector('[data-install]').hidden=true;}};
  try {
    const registration=await navigator.serviceWorker.register(config.worker,{scope:'./'});
    await navigator.serviceWorker.ready;
    status.textContent='Offline copy ready. On iPhone, use Share → Add to Home Screen.';
    const offerUpdate=()=>{if(registration.waiting)panel.querySelector('[data-update]').hidden=false;};
    offerUpdate();
    registration.addEventListener('updatefound',()=>registration.installing?.addEventListener('statechange',offerUpdate));
    panel.querySelector('[data-update]').onclick=()=>registration.waiting?.postMessage({type:'ACTIVATE_UPDATE'});
    let initialController=navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(initialController)location.reload();else initialController=navigator.serviceWorker.controller;});
  } catch(error) {status.textContent='Offline setup unavailable: '+error.message;}
})();
