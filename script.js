const currentSong = new Audio();
let songs = [];

function secondsToMinutesSeconds(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

async function getSongs() {
    const response = await fetch("./songs/");

    if (!response.ok) {
        throw new Error(`Could not load songs (HTTP ${response.status})`);
    }

    const html = await response.text();
    const listing = document.createElement("div");
    listing.innerHTML = html;

    return Array.from(listing.getElementsByTagName("a"))
        .map(link => decodeURIComponent(new URL(link.href).pathname.split("/").pop()))
        .filter(fileName => fileName.toLowerCase().endsWith(".mp3"));
}

function playMusic(track, pause = false) {
    currentSong.src = `/songs/${encodeURIComponent(track)}`;
    const seekbar = document.querySelector(".seekbar");
    seekbar.value = "0";
    seekbar.disabled = true;
    seekbar.style.setProperty("--seek-progress", "0%");
    seekbar.setAttribute("aria-valuetext", "00:00 of 00:00");

    if (!pause) {
        currentSong.play()
            .then(() => {
                document.getElementById("play").src = "/pause.svg";
            })
            .catch(error => console.error("Could not play song:", error));
    } else {
        document.getElementById("play").src = "/play.svg";
    }

    document.querySelector(".songinfo").textContent = track.replace(/\.mp3$/i, "");
    document.querySelector(".time").textContent = "00:00 / 00:00";
}

async function main() {
    songs = await getSongs();

    if (songs.length === 0) {
        throw new Error("No MP3 files were found in the songs folder.");
    }

    const playButton = document.getElementById("play");
    const previousButton = document.getElementById("previous");
    const nextButton = document.getElementById("nextsong");
    const songList = document.querySelector(".songlist ul");
    const seekbar = document.querySelector(".seekbar");
    const timeDisplay = document.querySelector(".time");
    const volumeInput = document.querySelector(".range input");
    const volumeButton = document.querySelector(".volume-toggle");
    const volumeLevel = document.querySelector(".volume-level");
    let previousVolume = Number(volumeInput.value) / 100;

    currentSong.volume = previousVolume;
    volumeInput.style.setProperty("--volume-level", `${volumeInput.value}%`);

    playMusic(songs[0], true);
    songList.replaceChildren();

    songs.forEach(song => {
        const item = document.createElement("li");
        item.innerHTML = `
            <img class="invert" width="34" src="/music.svg" alt="music">
            <div class="info">
                <div class="songname"></div>
                <div class="songartist"></div>
            </div>
            <div class="playnow">
                <span class="duration">Play now</span>
                <img class="invert" src="/play.svg" alt="play">
            </div>`;
        item.querySelector(".songname").textContent = song.replace(/\.mp3$/i, "");
        item.addEventListener("click", () => playMusic(song));
        songList.appendChild(item);
    });

    playButton.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
                .then(() => {
                    playButton.src = "/pause.svg";
                })
                .catch(error => console.error("Could not play song:", error));
        } else {
            currentSong.pause();
            playButton.src = "/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        timeDisplay.textContent =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

        if (Number.isFinite(currentSong.duration) && currentSong.duration > 0) {
            const progress = (currentSong.currentTime / currentSong.duration) * 100;
            seekbar.value = String(progress);
            seekbar.style.setProperty("--seek-progress", `${progress}%`);
            seekbar.setAttribute(
                "aria-valuetext",
                `${secondsToMinutesSeconds(currentSong.currentTime)} of ${secondsToMinutesSeconds(currentSong.duration)}`
            );
        }
    });

    currentSong.addEventListener("loadedmetadata", () => {
        seekbar.disabled = false;
        seekbar.value = "0";
        seekbar.style.setProperty("--seek-progress", "0%");
        timeDisplay.textContent = `00:00 / ${secondsToMinutesSeconds(currentSong.duration)}`;
        seekbar.setAttribute(
            "aria-valuetext",
            `00:00 of ${secondsToMinutesSeconds(currentSong.duration)}`
        );
    });

    currentSong.addEventListener("ended", () => {
        playButton.src = "/play.svg";
    });

    seekbar.addEventListener("input", () => {
        if (!Number.isFinite(currentSong.duration) || currentSong.duration <= 0) {
            return;
        }

        const progress = Number(seekbar.value);
        currentSong.currentTime = (progress / 100) * currentSong.duration;
        seekbar.style.setProperty("--seek-progress", `${progress}%`);
        seekbar.setAttribute(
            "aria-valuetext",
            `${secondsToMinutesSeconds(currentSong.currentTime)} of ${secondsToMinutesSeconds(currentSong.duration)}`
        );
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    const getCurrentSongIndex = () => {
        const currentFile = decodeURIComponent(new URL(currentSong.src).pathname.split("/").pop());
        return songs.indexOf(currentFile);
    };

    previousButton.addEventListener("click", () => {
        const index = getCurrentSongIndex();
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    nextButton.addEventListener("click", () => {
        const index = getCurrentSongIndex();
        if (index >= 0 && index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    volumeInput.addEventListener("input", event => {
        const volume = Number(event.target.value) / 100;
        currentSong.volume = volume;
        volumeInput.style.setProperty("--volume-level", `${event.target.value}%`);
        volumeLevel.textContent = `${event.target.value}%`;

        if (volume > 0) {
            previousVolume = volume;
            volumeButton.classList.remove("is-muted");
            volumeButton.setAttribute("aria-label", "Mute audio");
            volumeButton.title = "Mute audio";
        } else {
            volumeButton.classList.add("is-muted");
            volumeButton.setAttribute("aria-label", "Unmute audio");
            volumeButton.title = "Unmute audio";
        }
    });

    volumeButton.addEventListener("click", () => {
        if (currentSong.volume > 0) {
            previousVolume = currentSong.volume;
            currentSong.volume = 0;
            volumeInput.value = "0";
            volumeLevel.textContent = "0%";
            volumeInput.style.setProperty("--volume-level", "0%");
            volumeButton.classList.add("is-muted");
            volumeButton.setAttribute("aria-label", "Unmute audio");
            volumeButton.title = "Unmute audio";
        } else {
            currentSong.volume = previousVolume || 0.7;
            const volume = Math.round(currentSong.volume * 100);
            volumeInput.value = String(volume);
            volumeLevel.textContent = `${volume}%`;
            volumeInput.style.setProperty("--volume-level", `${volume}%`);
            volumeButton.classList.remove("is-muted");
            volumeButton.setAttribute("aria-label", "Mute audio");
            volumeButton.title = "Mute audio";
        }
    });
}

main().catch(error => {
    console.error("Unable to initialize the music player:", error);
});
