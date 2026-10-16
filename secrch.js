
console.log("Let's write JavaScript");

async function getSongs() {
    let a = await fetch("http://127.0.0.1:5500/songs/");
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    let songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (element.href.toLowerCase().includes(".mp3")) {
            songs.push(decodeURIComponent(element.href.split("/").pop()));
        }
    }

    return songs;
}

let currentAudio = null;
let play = document.getElementById("play");

function playmusic(track) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        // document.querySelector(".info").innerHTML = "track"
        // document.querySelector(".duration").innerHTML "00:00 / 00:00"
    }

    currentAudio = new Audio(
        "http://127.0.0.1:5500/songs/" +
        encodeURIComponent(track)
    );

    currentAudio.play()
        .then(() => {
            if (play) play.src = "pause.svg";
        })
        .catch(error => {
            console.error("Audio playback failed:", error);
        });

    currentAudio.onended = () => {
        if (play) play.src = "play.svg";

    };
}

async function main() {
    let songs = await getSongs();
    console.log("Songs found:", songs);

    let songul = document.querySelector(".songlist ul");

    if (!songul) {
        console.error("Song list element not found!");
        return;
    }

    songul.innerHTML = "";

    for (const song of songs) {
        let li = document.createElement("li");

        li.innerHTML = `
            <img class="invert" src="music.svg" alt="Music">

            <div class="info">
                <div class="songname"></div>
                <div class="songartist"></div>
            </div>

            <div class="playnow">
                <span class="duration">Play now</span>
                <img class="invert" src="play.svg" alt="Play">
            </div>
        `;

        li.querySelector(".songname").textContent = song;

        li.addEventListener("click", () => {
            playmusic(song);
        });

        songul.appendChild(li);
    }

    if (play) {
        play.addEventListener("click", () => {
            if (!currentAudio) {
                if (songs.length > 0) {
                    playmusic(songs[0]);
                }
                return;
            }

            if (currentAudio.paused) {
                currentAudio.play()
                    .then(() => {
                        play.src = "pause.svg";
                    })
                    .catch(error => {
                        console.error("Audio playback failed:", error);
                    });
            } else {
                currentAudio.pause();
                play.src = "play.svg";
            }
        });
    } else {
        console.error('Play button with id="play" not found!');
    }


    document.querySelector(".hamburger").addEventListener("click", () =>{
        document.querySelector(".left").style.left = "0"
    })
    document.querySelector(".close").addEventListener("click", () =>{
        document.querySelector(".left").style.left = "-120%"
    })



}

main().catch(error => {
    console.error("Error loading songs:", error);
});