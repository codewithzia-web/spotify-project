console.log("let write java script");
let Currentsong = new Audio();
let songs;
function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

async function getSongs() {


    let a = await fetch("http://127.0.0.1:5500/songs/");
    let response = await a.text();
    console.log(response)
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let song = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            song.push(element.href.split("/").pop());
        }
    }
    return song
}
const playMusic = (track, pause=false ) => {
    // let Audio = new Audio("/songs/" + track)
    CurrentSong.Currentsrc = "/songs/" + track
    if(!pause){

        CurrentSong.play()
        play.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".time").innerHTML = "00:00 / 00:00"
}
async function main() {
    
    songs = await getSongs();
    playMusic(songs[0], true)

    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    for (const song of songs) {

        songul.innerHTML = songul.innerHTML + `<li>
                                <img class="invert" src="music.svg" alt="music">
                            <div class="info">

                                <div class="songname">${song.replaceAll("%20", " ")}</div>
                                <div class="songartist"></div>
                            </div>
                            
                            <div class="playnow">
                                
                                <span class="duration">play now</span>
                                <img  class="invert" src="play.svg" alt="">
                            </div>
                        </li>`

    }


    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })

    play.addEventListener("click", () => {
        if (CurrentSong.paused) {
            CurrentSong.play()
            play.src = "pause.svg"
        }
        else {
            CurrentSong.pause()
            play.src = "play.svg"
        }
    })

    CurrentSong.addEventListener("timeupdate", () => {
        console.log(CurrentSong.currentTime, CurrentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondstominutessecond(CurrentSong.currenttime)}/${secondstominutessecond(CurrentSong.duration)}`
        document.querySelector(".circle").style.left =  (CurrentSong.currentTime/ CurrentSong.duration) * 100 + "%";

    })

    document.querySelector(".seekbar").addEventListener("click", ()=>{
        let percent = (e.offsetx/e.target.getboundingclientrect().width) * 100 + "%";
        document.querySelector(".circle").style.left = percent * "%";
        CurrentSong.currentTime = ((CurrentSong.duration)* percent)/100
    })
    document.querySelector(".hamburger").addEventListener("click", () =>{
        document.querySelector(".left").style.left = "0"
    })
    document.querySelector(".close").addEventListener("click", () =>{
        document.querySelector(".left").style.left = "-120%"
    })


    previous.addEventListener("clicl", ()=>{
        console.log("previous clicked")
        console.log("currentsong")
        let index = songs.indexof(CurrentSong.src.split("/").splice(-1) [0])
        if((index-1) >= 0){
            playMusic(song[index-1])
        }
    })
    next.addEventListener("clicl", ()=>{
        console.log("previous clicked")
        console.log("currentsong")
        let index = songs.indexof(CurrentSong.src.split("/").splice(-1) [0])
        if((index-1) < song.length){
            playMusic(song[index+1])
        }
    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        console.log("setting volume", e.target.value, "/100");
        Currentsong.volume = parseInt(e.target.volume)/100
        
    })

}
main();