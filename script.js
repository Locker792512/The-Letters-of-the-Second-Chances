document.addEventListener('DOMContentLoaded', function(){
    const btn = document.getElementById('openBtn');
    const envelope = document.getElementById('envelope');
    const audio = document.getElementById('letter-audio');
    const letterText = document.getElementById('letter-text');
    const source = document.getElementById('letter-source');

    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');

    // audio control elements (added inside the letter)
    const volumeRange = document.getElementById('volumeRange');
    const stopBtn = document.getElementById('stopBtn');
    const repeatBtn = document.getElementById('repeatBtn');
    const playBtn = document.getElementById('playBtn');

    let typingTimer = null;
    let wordIndex = 0;
    let words = [];
    const WORD_DELAY_MS = 20; 
    
    const VALID_USERNAME = 'Angel';
    const VALID_PASSWORD = 'Sam_code: Angel2003182209_Nitchi.';
    
    const MUSIC_TRACKS = [
        'Multo - Cup of Joe (Official Lyric Video).mp3',
        'blink-182 - I Miss You.mp3',
    ];
    let currentTrackIndex = 0;

    function prepareWords(){
        const raw = (source && source.textContent) ? source.textContent.trim() : '';
        words = raw.split(/(\s+)/).filter(Boolean);
    }

    function startTyping(){
        stopTyping(false);
        letterText.textContent = '';
        wordIndex = 0;
        if(!words.length) prepareWords();
        typingTimer = setInterval(()=>{
            if(wordIndex >= words.length){
                clearInterval(typingTimer); typingTimer = null; return;
            }
            letterText.textContent += words[wordIndex];
            wordIndex++;
            const inner = letterText.parentElement;
            inner.scrollTop = inner.scrollHeight;
        }, WORD_DELAY_MS);
    }

    function stopTyping(reset=true){
        if(typingTimer){ clearInterval(typingTimer); typingTimer = null; }
        if(reset){ letterText.textContent = ''; }
    }

    // initialize audio volume from control
    if(volumeRange){
        audio.volume = parseFloat(volumeRange.value);
        volumeRange.addEventListener('input', (e)=>{
            audio.volume = parseFloat(e.target.value);
        });
    }

    // Stop button: pause and reset audio
    if(stopBtn){
        stopBtn.addEventListener('click', ()=>{
            audio.pause();
            try{ audio.currentTime = 0 }catch(e){}
            if(playBtn) { playBtn.textContent = '▶ Play'; playBtn.setAttribute('aria-pressed','false'); }
        });
    }

    // Repeat button: toggle audio.loop
    if(repeatBtn){
        repeatBtn.addEventListener('click', ()=>{
            audio.loop = !audio.loop;
            repeatBtn.setAttribute('aria-pressed', String(audio.loop));
            if(audio.loop){ repeatBtn.classList.add('active') } else { repeatBtn.classList.remove('active') }
        });
    }

    // Play/Pause button
    function updatePlayButton(isPlaying){
        if(!playBtn) return;
        if(isPlaying){
            playBtn.textContent = '⏸ Pause';
            playBtn.setAttribute('aria-pressed','true');
            playBtn.classList.add('active');
        } else {
            playBtn.textContent = '▶ Play';
            playBtn.setAttribute('aria-pressed','false');
            playBtn.classList.remove('active');
        }
    }

    if(playBtn){
        playBtn.addEventListener('click', ()=>{
            if(audio.paused){
                try{ audio.play(); updatePlayButton(true); }catch(e){}
            } else {
                audio.pause(); updatePlayButton(false);
            }
        });
    }

    // Keep play button in sync with audio events
    audio.addEventListener('play', ()=> updatePlayButton(true));
    audio.addEventListener('pause', ()=> updatePlayButton(false));

    // If audio ends naturally, load and play next track
    audio.addEventListener('ended', ()=>{
        currentTrackIndex++;
        if(currentTrackIndex < MUSIC_TRACKS.length){
            audio.src = MUSIC_TRACKS[currentTrackIndex];
            audio.play().catch(()=>{});
        } else {
            currentTrackIndex = 0;
        }
        updatePlayButton(false);
    });

    btn.disabled = true;

    btn.addEventListener('click', () => {
        const opened = envelope.classList.toggle('open');
        btn.textContent = opened ? 'Close Letter' : 'Open Letter';
        if(opened){
            currentTrackIndex = 0;
            try{ audio.currentTime = 0 }catch(e){}
            audio.src = MUSIC_TRACKS[currentTrackIndex];
            audio.play().catch(()=>{});
            prepareWords();
            startTyping();
        } else {
            try{ audio.pause(); audio.currentTime = 0 }catch(e){}
            stopTyping(true);
            if(loginModal){ loginModal.style.display = 'flex'; }
            btn.disabled = true;
            if(usernameInput) usernameInput.value = '';
            if(passwordInput) passwordInput.value = '';
            if(loginError) loginError.textContent = '';
            if(usernameInput) usernameInput.focus();
        }
    });

    // Login form handling
    function acceptLogin(){
        if(loginModal){ loginModal.style.display = 'none'; }
        btn.disabled = false;
        btn.focus();
        if(loginError) loginError.textContent = '';
    }

    function rejectLogin(msg){
        if(loginError) loginError.textContent = msg || 'Invalid imong username or password';
        alert('Mali ang passwords or nay kulang');
        if(loginModal){
            loginModal.classList.remove('login-shake');
            void loginModal.offsetWidth;
            loginModal.classList.add('login-shake');
        }
    }

    if(loginForm){
        loginForm.addEventListener('submit', function(e){
            e.preventDefault();
            const u = usernameInput.value ? usernameInput.value.trim() : '';
            const p = passwordInput.value ? passwordInput.value.trim() : '';
            const pNoDot = VALID_PASSWORD.replace(/\.$/, '');
            if(u === VALID_USERNAME && (p === VALID_PASSWORD || p === pNoDot)){
                acceptLogin();
            } else {
                rejectLogin('Mali ang username or ang password');
            }
        });
    }

    // Optional: pressing Escape clears error and focuses username
    document.addEventListener('keydown', (ev)=>{
        if(ev.key === 'Escape' && loginModal && loginModal.style.display !== 'none'){
            if(loginError) loginError.textContent = '';
            usernameInput.focus();
        }
    });

    // Initialize: prepare words so first open is immediate
    prepareWords();
}());