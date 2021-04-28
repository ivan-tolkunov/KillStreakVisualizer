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
  private _eventsLog: HTMLElement;
  // private _infoLog: HTMLElement;

  private fall_audio = new Audio();
  private kill_audio = new Audio();

  private last_killer = false;

  private player_name = null;

  private constructor() {
    super(windowNames.inGame);

    this._eventsLog = document.getElementById('eventsLog');
    // this._infoLog = document.getElementById('infoLog');

    this.fall_audio.src = "../../audio/lllet me die.wav";
    this.fall_audio.load();
    this.fall_audio.volume = 1;

    this.kill_audio.src = "../../audio/sword.mp3";
    this.kill_audio.load();
    this.kill_audio.volume = 0.8;

    this.setToggleHotkeyBehavior();
    // this.setToggleHotkeyText();

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
    // console.log(info.me.name)
    return 0
  }

  // Special events will be highlighted in the event log
  private onNewEvents(e) {

    var event = e.events[0]

    function log_event(){
      console.log(event.name+" --> "+ event.data);
    }

    switch(event.name){
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
          this.causeEvent(event, "suicide");
        }
        break;

      case 'knockedout':
        log_event();
        if(event.data == this.player_name){
          this.causeEvent(event, "suicide");
        }
        break;

      case 'killed':
      case 'knockout':
      case 'kill':
        this.causeEvent(event, "kill");
        break;

    }
    // log_event()
  }


  private causeEvent(data, type) {
    // var log = this._eventsLog

    // const line = document.createElement('pre');
    // line.textContent = JSON.stringify(data);

    switch (type) {
      case 'death':
        // this.fall_audio.play();
        break;
      case "kill":
        this.kill_audio.play();
        break;
      case "suicide":
        this.fall_audio.play();
        break;
    }

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

  }

  // public parse_event(e){
  //   var event = e.events[0];
  //   return event;
  // }






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
