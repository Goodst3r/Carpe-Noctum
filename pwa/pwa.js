/* Hosted-shell features only. All technician/job data remains in the base app. */
(function () {
  'use strict';
  const configElement = document.getElementById('nightSweepPwaConfig');
  const home = document.getElementById('homePanel');
  if (!configElement || !home || window.NightSweepAndroid) return;
  let config;
  try {config = JSON.parse(configElement.textContent);} catch (_) {return;}
  const base = new URL('./', location.href);
  const section = document.createElement('section');
  section.className = 'pwa-card';
  section.id = 'pwaCard';
  section.setAttribute('aria-labelledby', 'pwaHeading');
  section.innerHTML = '<h2 id="pwaHeading">Carpe Noctum on this device</h2>' +
    '<p id="pwaStatus" class="pwa-state" role="status" aria-live="polite" data-ready="false">Preparing offline use…</p>' +
    '<p id="pwaStatusDetail" class="pwa-small">Keep this page open and online until its offline copy is ready.</p>' +
    '<div class="toolbar"><button id="pwaInstall" type="button" hidden>Install app</button><button id="pwaCheckUpdates" type="button">Check for updates</button><button id="pwaApplyUpdate" type="button" hidden>Install update</button><button id="pwaReload" type="button" hidden>Reload app</button><button id="pwaRetry" type="button" hidden>Retry offline setup</button></div>' +
    '<p id="pwaUpdateStatus" class="pwa-small" role="status" aria-live="polite">Updates wait for your action. Export your current job before updating.</p>' +
    '<details><summary>Install on a phone</summary><p class="pwa-small">Use this website directly on Android or iPhone. Installing a Home Screen icon is optional; no APK is needed for the web version.</p><div class="toolbar"><a href="android.html">Android / no APK</a><a href="iphone.html">iPhone install</a><a href="install.html">Install help</a></div></details>' +
    '<details><summary>Offline guides</summary><p><a href="functions-guide.html">All functions reference</a></p><p><a href="phone-installation.html">Android and iOS installation</a></p><p><a href="training-coverage.html">Training examples and feature coverage</a></p></details>' +
    '<details><summary>Keep your work safe</summary><p>Jobs and ONX files stay on this device. Use <b>Files → Back up project</b> to export a backup for every job you need. Keep the file in Files or another location outside this app.</p><p>The Android APK and web app use separate job storage. Export from the app containing your work, then import that backup in the browser or icon you will use. Before adding Carpe Noctum to an iPhone Home Screen, export any browser jobs. Open the installed icon and import the backup if the job is not there. Use one Carpe Noctum window at a time to avoid overwriting another window’s edits.</p><p id="pwaStorageStatus" class="pwa-small" role="status"></p><button id="pwaPersist" type="button" hidden>Protect local storage</button><p class="pwa-small">Storage protection is optional and browser dependent. Clearing website data or removing the app can still remove work. An exported backup is the safest copy.</p><p><a href="guide.html">Read the full technician guide</a></p></details>';
  const current = home.querySelector('.home-current');
  // 2.0: device and update status sits at the end of Home, after the field tasks.
  if (current) home.append(section); else home.prepend(section);
  const $ = id => document.getElementById(id);
  // The panel sits at the end of Home; a short notice near the top points to a waiting update.
  if (current && typeof MutationObserver !== 'undefined') {
    const notice = document.createElement('p');
    notice.id = 'pwaUpdateNotice'; notice.className = 'status'; notice.hidden = true;
    notice.innerHTML = 'An app update is ready. <a href="#pwaCard">Install it at the bottom of Home</a> after backing up your job.';
    current.append(notice);
    const sync = () => {notice.hidden = $('pwaApplyUpdate').hidden;};
    new MutationObserver(sync).observe($('pwaApplyUpdate'), {attributes: true, attributeFilter: ['hidden']});
  }
  const status = (label, detail, ready = false) => {
    $('pwaStatus').textContent = label;
    $('pwaStatus').dataset.ready = String(ready);
    $('pwaStatusDetail').textContent = detail;
  };
  const update = text => {$('pwaUpdateStatus').textContent = text;};
  let registration = null;
  let candidate = null;
  let activeVersion = null;
  let updateAuthorized = false;
  let initialController = null;
  let offlineReady = false;
  let promptEvent = null;
  let checking = 0;
  const localPreview = ['localhost','127.0.0.1','[::1]'].includes(location.hostname);
  const secure = window.isSecureContext === true && (location.protocol === 'https:' || (location.protocol === 'http:' && localPreview));

  function workerStatus(worker, type = 'GET_OFFLINE_STATUS') {
    return new Promise(resolve => {
      if (!worker || typeof MessageChannel === 'undefined') return resolve(null);
      const channel = new MessageChannel();
      const timer = setTimeout(() => {channel.port1.close();resolve(null);}, type === 'REPAIR_OFFLINE' ? 60000 : 5000);
      channel.port1.onmessage = event => {
        clearTimeout(timer);channel.port1.close();
        resolve(['OFFLINE_STATUS','OFFLINE_REPAIRED'].includes(event.data?.type) ? event.data : null);
      };
      try {worker.postMessage({type}, [channel.port2]);}
      catch (_) {clearTimeout(timer);channel.port1.close();resolve(null);}
    });
  }
  async function refreshStatus() {
    const sequence = ++checking;
    const controller = navigator.serviceWorker?.controller;
    const result = await workerStatus(controller);
    if (sequence !== checking) return;
    offlineReady = !!controller && result?.ready === true;
    if (result?.version) activeVersion = result.version;
    if (offlineReady) {
      status('Ready for offline use', navigator.onLine === false ? 'You are offline. This app and its guides are available on this device.' : 'The app and its guides are saved on this device. Try opening Carpe Noctum in airplane mode before going into the field.', true);
      $('pwaRetry').hidden = true;
    } else {
      status(navigator.onLine === false ? 'Offline copy is not ready' : 'Preparing offline use…', 'Keep Carpe Noctum open and online. Offline readiness requires a complete saved copy controlled by this browser.');
      $('pwaRetry').hidden = false;
    }
  }
  function watch(worker) {
    if (!worker) return;
    const changed = async () => {
      if (worker.state === 'installed') {
        if (updateAuthorized && registration?.waiting) {
          update('Update downloaded. Activating the saved copy; your open job remains on screen.');
          registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});
        } else if (registration?.waiting && registration.active) {
          // A first install has no active worker yet; only a worker queued behind an active one is an update.
          $('pwaApplyUpdate').hidden = false;
          update('A downloaded update is waiting. Export your current job, then choose Install update.');
        }
      }
      if (worker.state === 'activated') await refreshStatus();
      if (worker.state === 'redundant') {
        updateAuthorized = false;
        update('Offline setup or update did not finish. Your previous saved copy is kept. Reconnect and try again.');
        $('pwaRetry').hidden = false;
        $('pwaApplyUpdate').disabled = false;
      }
    };
    worker.addEventListener('statechange', changed);
    changed();
  }
  function attach(reg) {
    registration = reg;
    reg.addEventListener('updatefound', () => watch(reg.installing));
    watch(reg.installing);
    if (reg.waiting && reg.active) {
      $('pwaApplyUpdate').hidden = false;
      update('A downloaded update is waiting. Export your current job, then choose Install update.');
    }
  }
  function validRelease(data) {
    return data && /^[a-f0-9]{16,64}$/.test(data.version) && data.worker === 'sw.' + data.version + '.js';
  }
  async function setup() {
    try {
      let reg = await navigator.serviceWorker.getRegistration(base.href);
      if (reg && reg.scope !== base.href) throw new Error('Another service worker controls this location');
      if (!reg) {
        if (!validRelease(config)) throw new Error('Invalid offline build');
        reg = await navigator.serviceWorker.register(new URL(config.worker, base).href, {scope:base.href,updateViaCache:'none'});
      }
      // A versioned worker URL prevents a browser's automatic update check from
      // downloading a different release without the technician's action.
      attach(reg);
      await refreshStatus();
    } catch (_) {
      status('Offline setup could not finish', 'Keep a connection and retry. Browser privacy settings or limited storage may prevent offline use.');
      $('pwaRetry').hidden = false;
    }
  }
  $('pwaCheckUpdates').addEventListener('click', async () => {
    $('pwaCheckUpdates').disabled = true;
    update('Checking for an update…');
    try {
      const response = await fetch(new URL('release.json', base), {cache:'no-store',credentials:'same-origin'});
      if (!response.ok) throw new Error('Release unavailable');
      const release = await response.json();
      if (!validRelease(release)) throw new Error('Invalid release');
      await refreshStatus();
      if (release.version === activeVersion) {
        candidate = null;
        $('pwaApplyUpdate').hidden = !registration?.waiting;
        update('This device has the current offline release.');
      } else {
        candidate = release;
        $('pwaApplyUpdate').hidden = false;
        $('pwaApplyUpdate').disabled = false;
        update('An update is available. Export your current job before installing it.');
      }
    } catch (_) {update('Could not check for updates. Connect to the internet and try again. Your saved copy has not changed.');}
    finally {$('pwaCheckUpdates').disabled = false;}
  });
  $('pwaApplyUpdate').addEventListener('click', async () => {
    if (!window.confirm('Export the current job first using Files → Back up project. Install the update now? The page will stay open until you choose Reload app.')) return;
    updateAuthorized = true;
    $('pwaApplyUpdate').disabled = true;
    try {
      if (candidate) {
        update('Downloading the update. Keep Carpe Noctum open and online.');
        attach(await navigator.serviceWorker.register(new URL(candidate.worker, base).href, {scope:base.href,updateViaCache:'none'}));
      }
      if (registration?.waiting) registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});
      else if (!registration?.installing) {
        await refreshStatus();
        if (offlineReady) {
          $('pwaReload').hidden = false;
          update('The saved release is ready. Reload the app when your job backup is safe.');
        } else {
          update('The offline copy is incomplete. Choose Retry offline setup while connected.');
          $('pwaApplyUpdate').disabled = false;
        }
      }
    } catch (_) {
      updateAuthorized = false;
      update('The update could not be installed. Your previous offline copy is kept. Reconnect and try again.');
      $('pwaApplyUpdate').disabled = false;
    }
  });
  $('pwaReload').addEventListener('click', () => {
    if (window.confirm('Have you exported the current job? Reload Carpe Noctum now to open the saved release?')) location.reload();
  });
  $('pwaRetry').addEventListener('click', async () => {
    $('pwaRetry').disabled = true;
    try {
      if (navigator.serviceWorker.controller) {
        status('Repairing offline copy…', 'Keep Carpe Noctum online while its public app files are checked. Your jobs are unchanged.');
        const result = await workerStatus(navigator.serviceWorker.controller, 'REPAIR_OFFLINE');
        await refreshStatus();
        if (!result?.ready) update('The saved release could not be repaired. Connect and use Check for updates to install the current release. Export your job first.');
      } else if (registration && !registration.active && !registration.installing) {
        attach(await navigator.serviceWorker.register(new URL(config.worker, base).href, {scope:base.href,updateViaCache:'none'}));
      } else await setup();
    } catch (_) {status('Offline setup could not finish', 'Reconnect and try again. The app remains usable while online.');}
    finally {$('pwaRetry').disabled = false;}
  });
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();promptEvent = event;$('pwaInstall').hidden = false;
  });
  $('pwaInstall').addEventListener('click', async () => {
    if (!promptEvent) return;
    const event = promptEvent;promptEvent = null;
    $('pwaInstall').disabled = true;
    try {
      await event.prompt();
      const choice = await event.userChoice;
      update(choice?.outcome === 'accepted' ? 'Home Screen installation requested. Open the new icon online and check Ready for offline use.' : 'You can keep using Carpe Noctum in this browser. Use the browser menu to install later.');
    } catch (_) {
      update('The install prompt could not open. You can keep using the site, or use Chrome’s menu → Install and create shortcut / Add to Home screen.');
    } finally {
      $('pwaInstall').hidden = true;
      $('pwaInstall').disabled = false;
    }
  });
  window.addEventListener('appinstalled', () => {$('pwaInstall').hidden = true;promptEvent = null;});
  async function storageStatus() {
    const storage = navigator.storage;
    if (!storage?.persisted) {$('pwaStorageStatus').textContent = 'This browser does not report storage protection. Keep exported backups.';return;}
    try {
      const protectedStorage = await storage.persisted();
      $('pwaStorageStatus').textContent = protectedStorage ? 'Persistent storage is granted for this browser. Keep exported backups too.' : 'Browser-managed storage: this browser may remove local data under storage pressure.';
      $('pwaPersist').hidden = protectedStorage || typeof storage.persist !== 'function';
    } catch (_) {$('pwaStorageStatus').textContent = 'Storage protection status is unavailable. Keep exported backups.';}
  }
  $('pwaPersist').addEventListener('click', async () => {
    $('pwaPersist').disabled = true;
    try {
      const granted = await navigator.storage.persist();
      await storageStatus();
      if (!granted) $('pwaStorageStatus').textContent = 'Storage protection was not granted. You can still use Carpe Noctum; export backups regularly.';
    } catch (_) {$('pwaStorageStatus').textContent = 'Storage protection is unavailable. Export backups regularly.';}
    finally {$('pwaPersist').disabled = false;}
  });
  storageStatus();
  if (!secure || !('serviceWorker' in navigator)) {
    status('Offline setup is unavailable here', 'Open the HTTPS Carpe Noctum site in a supported browser. This file or preview cannot prepare the installed offline app.');
    $('pwaCheckUpdates').hidden = true;
    return;
  }
  initialController = navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', async () => {
    await refreshStatus();
    if (initialController || updateAuthorized) {
      $('pwaReload').hidden = false;
      $('pwaApplyUpdate').hidden = true;
      $('pwaApplyUpdate').disabled = false;
      updateAuthorized = false;
      update('Update ready. Export your current job, then choose Reload app. Nothing reloads automatically.');
    }
    initialController = navigator.serviceWorker.controller;
  });
  window.addEventListener('online', refreshStatus);
  window.addEventListener('offline', refreshStatus);
  setup();
})();
