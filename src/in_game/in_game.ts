import { AppWindow } from "../AppWindow";
import {
  OWGamesEvents,
  OWHotkeys
} from "@overwolf/overwolf-api-ts";
import { interestingFeatures, hotkeys, windowNames, fortniteClassId } from "../consts";
import WindowState = overwolf.windows.WindowStateEx;


class InGame extends AppWindow {
  private static _instance: InGame;
  private _fortniteGameEventsListener: OWGamesEvents;
  private _eventsPlace: HTMLElement;

  private animation_1: HTMLElement;
  private animation_2: HTMLElement;

  private fall_audio = new Audio();
  private start_audio = new Audio();
  private streak_audio_3 = new Audio();
  private streak_audio_2 = new Audio();
  private won_audio = new Audio();

  private last_killer = false;

  private player_name = null;

  private streak_kills = 0;
  private streak_max_time = null;

  private constructor() {
    super(windowNames.inGame);
    
    this._eventsPlace = document.getElementById('eventsPlace');

    this.animation_1 = document.getElementById('animation1');
    this.animation_2 = document.getElementById('animation2');

    this.fall_audio.src = "../../audio/lllet me die.wav";
    this.fall_audio.load();
    this.fall_audio.volume = 1;

    this.start_audio.src = "../../audio/sword.mp3";
    this.start_audio.load();
    this.start_audio.volume = 0.8;

    this.streak_audio_2.src = "../../audio/povezlo-povezlo.wav";
    this.streak_audio_2.load();
    this.streak_audio_2.volume = 0.5;

    this.streak_audio_3.src = "../../audio/Фотографирую закат.wav";
    this.streak_audio_3.load();
    this.streak_audio_3.volume = 0.3;

    this.won_audio.src = "../../audio/Фотографирую закат.wav";
    this.won_audio.load();
    this.won_audio.volume = 0.5;

    this.setToggleHotkeyBehavior();

    this._fortniteGameEventsListener = new OWGamesEvents({
      onInfoUpdates: this.onInfoUpdates.bind(this),
      onNewEvents: this.onNewEvents.bind(this)
    },
      interestingFeatures);
  }

  private onInfoUpdates(info) {
    if (! this.player_name){
      this.player_name = info.me.name
    }
    return 0
  }

  // EVENT
  private onNewEvents(e) {
    
    var event = e.events[0]

    function log_event(){
      // console.log(event.name+" --> "+ event.data);
      return 0
    }

    switch(event.name){
      case "matchStart":
        this.playSound("start");

      case 'killer':
        log_event();
        this.last_killer = true;
        break;

      case 'death':
        if(this.last_killer){
          log_event();
          this.last_killer = false;
        }else{
          log_event();
          this.playSound("suicide");
        }
        break;

      case 'knockedout':
        log_event();
        if(event.data == this.player_name){
          this.playSound("suicide");
        }
        break;

      case 'won':
        this.playSound("won");
        break;

      case 'matchEnd':
        this.streak_kills = 0;
        break;

      // case 'killed':
      case 'knockout':
      case 'kill':
        if (this.streak_kills > 0){
          var new_date = new Date();
          if (new_date <= this.streak_max_time){
            this.streak_kills ++;
            this.create_date(1);
            this.streakEvent();
          }else{
            this.streak_kills = 1;
            this.create_date(1);
          }
        }else{
          this.streak_kills ++;
          this.create_date(1);
        }

        console.log("STREAK --> "+this.streak_kills);

        break;

    }
    if(event.name != "hit"){
      console.log(event)
    }
  }
  // STREAK
  private streakEvent(){
    // switch(this.streak_kills){
    //   case 3:
    //     this.playSound("killstreak_3")
    //     this.displayAnimation("killstreak_3");
    // }
    if(this.streak_kills == 2){
      this.playSound("killstreak_2")
    }
    if(this.streak_kills >= 3){
      this.playSound("killstreak_3")
      // this.displayAnimation("killstreak_3");
    }
  }
  // PLAY
  private playSound(type) {
    
    switch (type) {
      case 'start':
        this.start_audio.play();
        break;

      case "killstreak_2":
        this.streak_audio_2.play();
        break;
  
      case "killstreak_3":
        this.streak_audio_3.play();
        break;

      case "suicide":
        this.fall_audio.play();
        break;

      case "won":
        this.won_audio.play();
        break;
    }

  }
  // DISPLAY
  private displayAnimation(type){

    var animation_1 = this.animation_1
    var animation_2 = this.animation_2

    function show_element(element){
      element.style.display = 'block';
    }
    function hide_element(element){
      element.style.display = 'none';
    }

    function _delay(ms: number) {
      return new Promise( resolve => setTimeout(resolve, ms) );
    }
    function show(seconds, animation){
      (async () => {
        console.log("show_start")
        show_element(animation)
        console.log(animation)
        await _delay(seconds*1000);
        console.log("show_end")
        hide_element(animation)
      })();
    }

    switch(type){
      case "killstreak_3":
        show(10, animation_1)

    }
  }

  private create_date(minutes){
    this.streak_max_time = new Date();
    this.streak_max_time = this.streak_max_time.getTime()+(minutes * 60000);
  }


  public static instance() {
    if (!this._instance) {
      this._instance = new InGame();
    }

    return this._instance;
  }

  public run() {
    this._fortniteGameEventsListener.start();
  }

  private async setToggleHotkeyBehavior() {
    const toggleInGameWindow = async (hotkeyResult: overwolf.settings.hotkeys.OnPressedEvent): Promise<void> => {
      console.log(`pressed hotkey for ${hotkeyResult.name}`);
      const inGameState = await this.getWindowState();

      if (inGameState.window_state === WindowState.NORMAL ||
        inGameState.window_state === WindowState.MAXIMIZED) {
        this.currWindow.minimize();
      } else if (inGameState.window_state === WindowState.MINIMIZED ||
        inGameState.window_state === WindowState.CLOSED) {
        this.currWindow.restore();
      }
    }

    OWHotkeys.onHotkeyDown(hotkeys.toggle, toggleInGameWindow);
  }

}

InGame.instance().run();



// var log = this._eventsLog

    // const line = document.createElement('pre');
    // line.textContent = JSON.stringify(data);
    // log.appendChild(line);
    
    // clear_delay(10);

    // function clear_delay(seconds){
    //   function delay(ms: number) {
    //     return new Promise( resolve => setTimeout(resolve, ms) );
    //   }
    //   (async () => { 
    //     // console.log('before delay')lllet me die.wav

    //     await delay(seconds*1000);

    //     // console.log('after delay');
    //     log.innerHTML="";
    //   })();
    // }