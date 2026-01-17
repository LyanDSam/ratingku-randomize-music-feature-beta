// Untuk HTML, tambahkan di <head>:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const SUPABASE_URL = "https://aervhwynaxjyzqeiijca.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcnZod3luYXhqeXpxZWlpamNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTAxNTcsImV4cCI6MjA4MzkyNjE1N30.iV8wkRk4_u58kdXyYcaOdN2Pc_8lNP3-1w6oFTo45Ew"

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

async function getFileLinks(bucketName, folderPath = '') {
  try {
    const { data: files, error } = await supabaseClient.storage
      .from(bucketName)
      .list(folderPath, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (error) throw error

    const fileLinks = files
      .filter(file => file.id !== null && !file.name.endsWith('/'))
      .map(file => {
        const filePath = folderPath ? `${folderPath}/${file.name}` : file.name
        const { data } = supabaseClient.storage
          .from(bucketName)
          .getPublicUrl(filePath)
        return data.publicUrl
      })

    return fileLinks

  } catch (error) {
    console.error('Error getting file links:', error)
    return []
  }
}

let playlist = [];

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

const ctx = new AudioContext();
const FADE_TIME = 2;
let index = 0;
let active = "A";
let isTransitioning = false;

function createAudioChain(audio) {
  const source = ctx.createMediaElementSource(audio);
  
  const mainGain = ctx.createGain();
  mainGain.gain.value = 1;

  const normalGain = ctx.createGain();
  normalGain.gain.value = 0.5;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 900;

  const deepGain = ctx.createGain();
  deepGain.gain.value = 0;

  source.connect(mainGain);
  mainGain.connect(normalGain).connect(ctx.destination);
  mainGain.connect(lowpass).connect(deepGain).connect(ctx.destination);

  return { mainGain, normalGain, deepGain };
}

const audioA = new Audio();
const audioB = new Audio();
audioA.crossOrigin = "anonymous";
audioB.crossOrigin = "anonymous";
audioA.preload = "auto";
audioB.preload = "auto";

const chainA = createAudioChain(audioA);
const chainB = createAudioChain(audioB);

let deepMode = false;

function setDeepMode(on) {
  const now = ctx.currentTime;
  const t = 0.5;

  [chainA, chainB].forEach(chain => {
    chain.normalGain.gain.linearRampToValueAtTime(on ? 0 : 0.5, now + t);
    chain.deepGain.gain.linearRampToValueAtTime(on ? 0.5 : 0, now + t);
  });

  deepMode = on;
}

function monitorAndTransition(audio) {
  const check = () => {
    if (audio !== (active === "A" ? audioA : audioB)) {
      return;
    }
    
    if (audio.paused || audio.ended) {
      return;
    }
    
    const timeLeft = audio.duration - audio.currentTime;
    
    if (timeLeft <= FADE_TIME && !isTransitioning) {
      isTransitioning = true;
      playNext();
    } else if (timeLeft > FADE_TIME) {
      requestAnimationFrame(check);
    } else {
      requestAnimationFrame(check);
    }
  };
  
  requestAnimationFrame(check);
}

function playNext() {
  const curAudio = active === "A" ? audioA : audioB;
  const curChain = active === "A" ? chainA : chainB;
  const nextAudio = active === "A" ? audioB : audioA;
  const nextChain = active === "A" ? chainB : chainA;

  nextAudio.src = playlist[index % playlist.length];
  nextAudio.load();
  
  nextAudio.onloadeddata = () => {
    nextAudio.onloadeddata = null;
    
    const now = ctx.currentTime;
    
    nextChain.mainGain.gain.cancelScheduledValues(now);
    nextChain.mainGain.gain.setValueAtTime(0, now);
    
    curChain.mainGain.gain.cancelScheduledValues(now);
    curChain.mainGain.gain.setValueAtTime(1, now);
    
    nextAudio.play().then(() => {
      curChain.mainGain.gain.linearRampToValueAtTime(0, now + FADE_TIME);
      nextChain.mainGain.gain.linearRampToValueAtTime(1, now + FADE_TIME);
      
      setTimeout(() => {
        curAudio.pause();
        curAudio.currentTime = 0;
        
        active = active === "A" ? "B" : "A";
        index++;
        isTransitioning = false;
        
        monitorAndTransition(nextAudio);
      }, FADE_TIME * 1000 + 200);
    }).catch(err => {
      console.error('Playback error:', err);
      isTransitioning = false;
      index++;
      setTimeout(() => playNext(), 500);
    });
  };
  
  nextAudio.onerror = () => {
    console.error('Load error');
    isTransitioning = false;
    index++;
    setTimeout(() => playNext(), 500);
  };
}

async function startBGM() {
  playlist = await getFileLinks("MUSIK", "");
  
  if (playlist.length === 0) {
    console.error('No music files found!');
    return;
  }
  
  shuffleArray(playlist);
  ctx.resume();
  
  chainA.mainGain.gain.setValueAtTime(1, ctx.currentTime);
  chainB.mainGain.gain.setValueAtTime(1, ctx.currentTime);
  
  audioA.src = playlist[0];
  audioA.load();
  
  audioA.onloadeddata = () => {
    audioA.onloadeddata = null;
    audioA.play().then(() => {
      index = 1;
      monitorAndTransition(audioA);
    }).catch(err => {
      console.error('Start error:', err);
    });
  };
}

// Cara pakai:
// startBGM(); // Panggil ini untuk mulai musik
// setDeepMode(true); // Aktifkan deep mode
// setDeepMode(false); // Matikan deep mode