/* UIU Pulse — browser-only adapter.
 * The original css/style.css and js/script.js are intentionally unchanged.
 * No PHP, external API, database, or build tool is required at runtime.
 * Accounts and actions below are LOCAL DEMOS, not university authentication.
 */
'use strict';

const PulseDemo = (() => {
  const API_BASE_URL = window.UIU_API_URL || 'http://localhost:5000';
  const PREFIX = 'uiu-pulse-demo-v1:';
  const ACCOUNT_KEY = PREFIX + 'accounts';
  const SESSION_KEY = PREFIX + 'session';
  const FLASH_KEY = PREFIX + 'flash';
  const DEMO_EMAIL = 'demo@uiu.ac.bd';
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const fallback = Object.create(null);

  function storage(type) {
    try { return type === 'session' ? window.sessionStorage : window.localStorage; }
    catch (_) { return null; }
  }
  function get(key, type = 'local') {
    try { return storage(type)?.getItem(key) ?? fallback[type + ':' + key] ?? null; }
    catch (_) { return fallback[type + ':' + key] ?? null; }
  }
  function put(key, value, type = 'local') {
    try { storage(type)?.setItem(key, value); }
    catch (_) { fallback[type + ':' + key] = value; }
  }
  function remove(key, type = 'local') {
    try { storage(type)?.removeItem(key); } catch (_) {}
    delete fallback[type + ':' + key];
  }
  function read(key, defaultValue, type = 'local') {
    try { return JSON.parse(get(key, type)) ?? defaultValue; }
    catch (_) { return defaultValue; }
  }
  function write(key, value, type = 'local') { put(key, JSON.stringify(value), type); }
  function accounts() { const value = read(ACCOUNT_KEY, []); return Array.isArray(value) ? value : []; }
  function currentUser() {
    const record = read(SESSION_KEY, null, 'session') || read(SESSION_KEY, null);
    const googleUser = read('user', null);
    if (googleUser?.email) return googleUser;
    if (!record || !record.user || !record.user.email) return null;
    if (record.expires && Date.now() > record.expires) {
      remove(SESSION_KEY, 'session'); remove(SESSION_KEY);
      return null;
    }
    return record.user;
  }
  function signIn(user, remember = false, message = '') {
    const publicUser = {name: user.name, email: user.email};
    const record = {user: publicUser, expires: remember ? Date.now() + 30 * 86400000 : null};
    remove(SESSION_KEY, 'session'); remove(SESSION_KEY);
    write(SESSION_KEY, record, remember ? 'local' : 'session');
    if (message) put(FLASH_KEY, message, 'session');
    window.location.assign('home.html');
  }
  function signOut() {
    remove(SESSION_KEY, 'session'); remove(SESSION_KEY);
    remove(FLASH_KEY, 'session');
    window.location.replace('index.html');
  }
  function bytesToHex(bytes) { return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join(''); }
  function hexToBytes(hex) { return new Uint8Array(hex.match(/.{2}/g).map(h => parseInt(h, 16))); }
  async function hashPassword(password, saltHex) {
    if (!window.crypto?.subtle) throw new Error('Browser password storage requires a secure localhost connection.');
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({name:'PBKDF2', salt:hexToBytes(saltHex), iterations:150000, hash:'SHA-256'}, key, 256);
    return bytesToHex(new Uint8Array(bits));
  }
  function error(form, message) {
    const box = form?.querySelector('.form-error');
    if (box) { box.textContent = message || ''; box.style.display = message ? 'block' : 'none'; }
  }
  function value(form, name) { return form.elements.namedItem(name)?.value || ''; }
  function busy(form, status) {
    const button = form.querySelector('button[type="submit"]:not([form])');
    if (!button) return;
    if (!button.dataset.originalText) button.dataset.originalText = button.textContent;
    button.disabled = status;
    button.textContent = status ? 'Please wait…' : button.dataset.originalText;
  }
  async function submitSignIn(form) {
    const email = value(form, 'email').trim().toLowerCase();
    const password = value(form, 'password');
    if (!email || !password) return error(form, 'Please enter your email and password.');
    if (!emailPattern.test(email)) return error(form, 'Enter a valid email address.');
    let user;
    if (email === DEMO_EMAIL) {
      if (password !== 'uiu12345') return error(form, 'Incorrect password. Please try again.');
      user = {name:'Demo Student', email:DEMO_EMAIL};
    } else {
      const account = accounts().find(a => a.email === email);
      if (!account) return error(form, 'No account found with that email. Try registering below.');
      const hash = await hashPassword(password, account.salt);
      if (hash !== account.hash) return error(form, 'Incorrect password. Please try again.');
      user = {name:account.name, email:account.email};
    }
    signIn(user, !!form.elements.namedItem('remember')?.checked, 'Welcome back, ' + user.name.split(' ')[0] + '!');
  }
  async function submitRegister(form) {
    const name = value(form,'name').trim();
    const email = value(form,'email').trim().toLowerCase();
    const password = value(form,'password');
    const password2 = value(form,'password2');
    if (!name || !email || !password || !password2) return error(form,'Please fill in all fields.');
    if (!emailPattern.test(email)) return error(form,'Enter a valid email address.');
    if (password.length < 6) return error(form,'Password must be at least 6 characters.');
    if (password !== password2) return error(form,'Passwords do not match.');
    if (!form.elements.namedItem('agree')?.checked) return error(form,'Please agree to the Privacy Policy to continue.');
    if (email === DEMO_EMAIL || accounts().some(a => a.email === email)) return error(form,'An account with this email already exists. Try signing in.');
    const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
    const hash = await hashPassword(password, salt);
    const updated = accounts();
    if (updated.some(a => a.email === email)) return error(form,'An account with this email already exists.');
    updated.push({name,email,salt,hash});
    write(ACCOUNT_KEY,updated);
    signIn({name,email},false,'Account created — welcome to UIU Pulse, ' + name.split(' ')[0] + '!');
  }
  function setupAuth() {
    const signedIn = currentUser();
    if (signedIn) { window.location.replace('home.html'); return; }
    for (const form of document.querySelectorAll('form[data-browser-auth]')) {
      form.addEventListener('submit', async event => {
        event.preventDefault();
        error(form,''); busy(form,true);
        try {
          if (value(form,'form') === 'signin') await submitSignIn(form);
          else await submitRegister(form);
        } catch (e) { error(form,e.message || 'The browser could not save this account.'); }
        finally { busy(form,false); }
      });
    }
    const demoForm = document.getElementById('demo-form');
    if (demoForm) demoForm.addEventListener('submit',e => {
      e.preventDefault();
      signIn({name:'Demo Student',email:DEMO_EMAIL},false,'Welcome back, Demo!');
    });
    const googleForm = document.getElementById('google-form');
    if (googleForm) googleForm.addEventListener('submit',e => {
      e.preventDefault();
      signIn({name:'Google User',email:'demo.google@uiu.ac.bd'},false,'Signed in with a demo Google profile (no OAuth).');
    });
    // The source already contains the correct tab-switching, password-eye and error styles.
    for (const a of document.querySelectorAll('.privacy-note a, label[for="reg-terms"] a')) {
      a.addEventListener('click',e => { e.preventDefault(); showToast('This is a browser-only demonstration. No account information is sent to UIU.'); });
    }
  }
  function stateKey() { return PREFIX + 'actions:' + (currentUser()?.email || 'guest'); }
  function actionState() {
    const data = read(stateKey(),{});
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  }
  function saveAction(key,value) { const state=actionState(); state[key]=value; write(stateKey(),state); }
  function itemKey(button) { return button.closest('[data-item-key]')?.dataset.itemKey || ''; }
  function restoreActions() {
    const state=actionState();
    document.querySelectorAll('[data-item-key]').forEach(card => {
      const item=card.dataset.itemKey;
      card.querySelectorAll('button[onclick*="toggleBookmark"]').forEach(btn => {
        if (!btn.dataset.defaultLabel) btn.dataset.defaultLabel=btn.textContent;
        setBookmark(btn,!!state['bookmark:'+item]);
      });
      card.querySelectorAll('button[data-action-key]').forEach(btn => {
        if (state['action:'+btn.dataset.actionKey]) {
          btn.textContent=btn.dataset.doneLabel || '✓ Done'; btn.disabled=true;
        }
      });
      card.querySelectorAll('button[onclick*="toggleCalBtn"]').forEach(btn => {
        if (state['calendar:'+item]) { btn.classList.add('added'); btn.textContent='✓ Added'; }
      });
    });
  }
  function setBookmark(btn,saved) {
    btn.classList.toggle('saved',saved);
    btn.textContent=saved ? (btn.dataset.defaultLabel?.includes('Save') ? '★ Saved' : '★') : (btn.dataset.defaultLabel || '🔖');
    btn.setAttribute('aria-pressed',String(saved));
  }
  function bookmark(btn) {
    const key=itemKey(btn); if (!key) return;
    const saved=!actionState()['bookmark:'+key];
    saveAction('bookmark:'+key,saved);
    document.querySelectorAll('[data-item-key]').forEach(card => {
      if (card.dataset.itemKey===key) card.querySelectorAll('button[onclick*="toggleBookmark"]').forEach(b=>setBookmark(b,saved));
    });
    showToast(saved ? 'Saved in this browser' : 'Removed from saved items');
  }
  function action(btn,doneLabel,verb) {
    if (btn.disabled) return;
    const key=btn.dataset.actionKey || itemKey(btn)+':'+btn.textContent.trim();
    saveAction('action:'+key,true);
    btn.textContent=doneLabel; btn.disabled=true;
    showToast('Demo: '+verb+' — saved in this browser.');
  }
  async function rsvp(btn,doneLabel,verb) {
    if (btn.disabled) return;
    const user=currentUser();
    if (!user?.email) {
      showToast('Please sign in before RSVPing for an event.');
      return;
    }

    const card=btn.closest('.ev-card');
    const eventKey=card?.dataset.itemKey;
    const eventName=card?.querySelector('h3')?.textContent.trim();
    if (!eventKey || !eventName) {
      showToast('This event could not be identified.');
      return;
    }

    btn.disabled=true;
    try {
      const response=await fetch(API_BASE_URL+'/api/rsvps',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          eventKey,
          eventName,
          email:user.email,
          eventDate:card.dataset.eventDate,
          eventLocation:card.dataset.eventLocation
        })
      });
      const result=await response.json().catch(()=>({}));
      if (!response.ok) throw new Error(result.message || 'Could not save RSVP');

      const key=btn.dataset.actionKey || eventKey+':RSVP Now';
      saveAction('action:'+key,true);
      btn.textContent=doneLabel;
      showToast('RSVP saved for '+user.email+'.');
    } catch (error) {
      btn.disabled=false;
      showToast(error.message.includes('Failed to fetch') ? 'Backend is unavailable. Start the backend with npm start.' : error.message);
    }
  }
  function cardValue(card,label) {
    const row=Array.from(card.querySelectorAll('.kv-row')).find(item=>item.querySelector('.k')?.textContent.trim()===label);
    return row?.querySelector('.v')?.textContent.trim() || '';
  }
  async function researchApply(btn,doneLabel,verb) {
    if (btn.disabled) return;
    const user=currentUser();
    if (!user?.email) {
      showToast('Please sign in before applying for a research program.');
      return;
    }

    const card=btn.closest('.prog-card');
    const programKey=card?.dataset.itemKey;
    const programName=card?.querySelector('h3')?.textContent.trim();
    if (!programKey || !programName) {
      showToast('This research program could not be identified.');
      return;
    }

    btn.disabled=true;
    try {
      const response=await fetch(API_BASE_URL+'/api/research-applications',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          programKey,
          programName,
          email:user.email,
          organization:card.querySelector('.org')?.textContent.trim(),
          department:cardValue(card,'Department'),
          amount:cardValue(card,'Amount'),
          deadline:cardValue(card,'Deadline'),
          eligibility:cardValue(card,'Eligibility')
        })
      });
      const result=await response.json().catch(()=>({}));
      if (!response.ok) throw new Error(result.message || 'Could not save application');

      const key=btn.dataset.actionKey || programKey+':Apply Now';
      saveAction('action:'+key,true);
      btn.textContent=doneLabel;
      showToast('Research application saved for '+user.email+'.');
    } catch (error) {
      btn.disabled=false;
      showToast(error.message.includes('Failed to fetch') ? 'Backend is unavailable. Start the backend with npm start.' : error.message);
    }
  }
  async function competitionRegister(btn,doneLabel,verb) {
    if (btn.disabled) return;
    const user=currentUser();
    if (!user?.email) {
      showToast('Please sign in before registering for a competition.');
      return;
    }

    const card=btn.closest('.prog-card');
    const competitionKey=card?.dataset.itemKey;
    const competitionName=card?.querySelector('h3')?.textContent.trim();
    if (!competitionKey || !competitionName) {
      showToast('This competition could not be identified.');
      return;
    }

    btn.disabled=true;
    try {
      const response=await fetch(API_BASE_URL+'/api/competition-registrations',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          competitionKey,
          competitionName,
          email:user.email,
          organization:card.querySelector('.org')?.textContent.trim(),
          registrationDeadline:cardValue(card,'Registration Deadline'),
          eventDate:cardValue(card,'Event Date'),
          teamSize:cardValue(card,'Team Size'),
          eligibility:cardValue(card,'Eligibility'),
          prizePool:cardValue(card,'Prize Pool')
        })
      });
      const result=await response.json().catch(()=>({}));
      if (!response.ok) throw new Error(result.message || 'Could not save registration');

      const key=btn.dataset.actionKey || competitionKey+':Register Now';
      saveAction('action:'+key,true);
      btn.textContent=doneLabel;
      showToast('Competition registration saved for '+user.email+'.');
    } catch (error) {
      btn.disabled=false;
      showToast(error.message.includes('Failed to fetch') ? 'Backend is unavailable. Start the backend with npm start.' : error.message);
    }
  }
  function icsText(eventCard) {
    const dateText=eventCard.dataset.eventDate || '';
    const [day,times]=dateText.split('·').map(s=>s.trim());
    if (!day || !times) return null;
    const [startText,endText]=times.split(/[–—]/).map(s=>s.trim());
    const begin=new Date(day+' '+startText+' GMT+0600');
    const end=new Date(day+' '+endText+' GMT+0600');
    if (isNaN(begin.getTime())) return null;
    if (isNaN(end.getTime()) || end<=begin) end.setTime(begin.getTime()+3600000);
    const stamp=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    const escape=s=>String(s).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
    const title=eventCard.querySelector('h3')?.textContent.trim() || 'UIU Event';
    const location=eventCard.dataset.eventLocation || '';
    const uid=encodeURIComponent(eventCard.dataset.itemKey).replace(/%/g,'')+'@uiu-pulse-demo.local';
    return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//UIU Pulse//Browser Demo//EN','BEGIN:VEVENT','UID:'+uid,'DTSTAMP:'+stamp(new Date()),'DTSTART:'+stamp(begin),'DTEND:'+stamp(end),'SUMMARY:'+escape(title),'LOCATION:'+escape(location),'DESCRIPTION:Sample event from UIU Pulse browser demo.','END:VEVENT','END:VCALENDAR'].join('\r\n')+'\r\n';
  }
  function calendar(btn) {
    const card=btn.closest('.ev-card'); if (!card) return;
    const key=card.dataset.itemKey, added=!btn.classList.contains('added');
    saveAction('calendar:'+key,added);
    document.querySelectorAll('.ev-card').forEach(c=>{
      if(c.dataset.itemKey===key) c.querySelectorAll('button[onclick*="toggleCalBtn"]').forEach(b=>{b.classList.toggle('added',added);b.textContent=added?'✓ Added':'+ Cal';});
    });
    if (!added) { showToast('Removed from your local calendar list'); return; }
    const content=icsText(card);
    if (content) {
      const url=URL.createObjectURL(new Blob([content],{type:'text/calendar;charset=utf-8'}));
      const a=document.createElement('a');a.href=url;a.download='uiu-pulse-event.ics';a.style.display='none';document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
      showToast('Saved locally. Import the downloaded .ics file into your calendar.');
    } else showToast('Saved to your local demo calendar list');
  }
  async function share() {
    const key=document.activeElement?.closest('[data-item-key]')?.dataset.itemKey;
    const url=new URL(window.location.href);url.hash=key?'item='+encodeURIComponent(key):'';
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url.href);
      else {
        const input=document.createElement('textarea');input.value=url.href;input.style.position='absolute';input.style.left='-9999px';document.body.appendChild(input);input.select();
        if (!document.execCommand('copy')) throw new Error('Copy unavailable');input.remove();
      }
      showToast('Link copied to clipboard');
    } catch (_) { window.prompt('Copy this link:',url.href); }
  }
  function resetHelp(event) {
    event.preventDefault();
    showToast('Password reset email is unavailable in this browser-only demo. Use the demo account or create another local account.');
  }
  function setupPage() {
    const user=currentUser();
    document.querySelectorAll('[data-auth-state="guest"]').forEach(el=>{el.style.display=user?'none':'';});
    document.querySelectorAll('[data-auth-state="user"]').forEach(el=>{el.style.display=user?'':'none';});
    if(user) document.querySelectorAll('.user-chip').forEach(chip=>{
      const avatar=chip.querySelector('.av');
      if(avatar) {
        avatar.textContent='';
        if(user.photoURL) {
          const image=document.createElement('img');
          image.src=user.photoURL;
          image.alt=user.name || 'Profile photo';
          image.style.cssText='width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;';
          avatar.appendChild(image);
        } else {
          avatar.textContent=(user.name || user.email).charAt(0).toUpperCase();
        }
      }
      const label=chip.querySelector('span');if(label)label.textContent=user.name || user.email.split('@')[0];
      chip.title='Signed in as '+user.email;
    });
    restoreActions();
    document.querySelectorAll('.live-pill').forEach(el=>{
      for(const node of Array.from(el.childNodes)) if(node.nodeType===Node.TEXT_NODE)node.textContent='Demo';
      el.title='Sample data — not a live university feed';
    });
    document.querySelectorAll('.pill-tag').forEach(el=>{
      if(el.textContent.includes('Live updates enabled'))el.lastChild.textContent=' Sample updates enabled';
    });
    const banner=document.getElementById('traffic-banner');
    if(banner && actionState()['banner:dismissed'])banner.classList.add('hidden');
    if(banner)banner.querySelector('button.close')?.addEventListener('click',()=>saveAction('banner:dismissed',true));
    const notification=document.getElementById('notif-dot');
    if(notification && actionState()['notifications:read'])notification.style.display='none';
    const flash=get(FLASH_KEY,'session');
    if(flash){remove(FLASH_KEY,'session');showToast(flash);}
    if(window.location.hash.startsWith('#item=')){
      let key='';try{key=decodeURIComponent(window.location.hash.slice(6));}catch(_){}
      const card=Array.from(document.querySelectorAll('[data-item-key]')).find(el=>el.dataset.itemKey===key);
      if(card){card.scrollIntoView({block:'center'});card.style.outline='2px solid var(--blue-500, #2563eb)';card.style.outlineOffset='4px';}
    }
    if(window.location.hash==='#search')document.getElementById('news-search')?.focus();
    const modal=document.getElementById('story-modal');
    if(modal){modal.addEventListener('click',e=>{if(e.target===modal)closeStoryModal();});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeStoryModal();});}
  }
  return {currentUser,signOut,setupAuth,setupPage,bookmark,action,rsvp,researchApply,competitionRegister,calendar,share,resetHelp,saveAction};
})();

// Override only the original functions that require real persistence or external services.
// Filters, modal rendering, tabs, password visibility and mobile-nav behavior remain original.
function toggleBookmark(btn){PulseDemo.bookmark(btn);}
function toggleActionBtn(btn,doneLabel,verb){
  if (btn.closest('.ev-card')) PulseDemo.rsvp(btn,doneLabel,verb);
  else if (btn.closest('.prog-card') && verb.includes('applied')) PulseDemo.researchApply(btn,doneLabel,verb);
  else if (btn.closest('.prog-card') && verb.includes('registered')) PulseDemo.competitionRegister(btn,doneLabel,verb);
  else PulseDemo.action(btn,doneLabel,verb);
}
function toggleCalBtn(btn){PulseDemo.calendar(btn);}
function shareItem(){PulseDemo.share();}
function handleForgotPassword(event){PulseDemo.resetHelp(event);}
const originalToggleNotifPanel=toggleNotifPanel;
toggleNotifPanel=function(){originalToggleNotifPanel();PulseDemo.saveAction('notifications:read',true);};

if(document.body.dataset.page==='logout')PulseDemo.signOut();
else if(document.body.dataset.page==='index')PulseDemo.setupAuth();
else PulseDemo.setupPage();
