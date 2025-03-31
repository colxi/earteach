/*
	Project Name: JSPiano
	Version: 1.1.2 (21/05/2013)
	Author: colxi
	Author URI: https://www.colxi.info/
	Description: JSPiano is a tiny piano written in Javascript. Can handle many soundbanks
	in different programs. Comes by default with a Piano SoundBank.
	
	Usage: For default initialization, call init(pianoContainer). 
		After loading default Soundbank, piano GUI will be renderen in pianoContainer
		
		For custom initialization, with custom callback after soundbank is loaded
		call loadSoundBank(soundbankDef,programID,callback)
		soundbankDef (array): Each key, contains url to sound, or null
		programID (integer): Program ID where soundbank samples will be stored
		callback (function): Will be alled after loading proces is complete. 
		
		NOTE: In custom initialization, piano.draw(pianoContainer), must be called manually.
		
*/

/*
    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/

var piano = {
  defaultSoundBank:
    '[null,null,null,null,null,null,null,null,null,null,"samples/grandpiano/key_f_022.ogg","samples/grandpiano/key_f_023.ogg","samples/grandpiano/key_f_024.ogg","samples/grandpiano/key_f_025.ogg","samples/grandpiano/key_f_026.ogg","samples/grandpiano/key_f_027.ogg","samples/grandpiano/key_f_028.ogg","samples/grandpiano/key_f_029.ogg","samples/grandpiano/key_f_030.ogg","samples/grandpiano/key_f_031.ogg","samples/grandpiano/key_f_032.ogg","samples/grandpiano/key_f_033.ogg","samples/grandpiano/key_f_034.ogg","samples/grandpiano/key_f_035.ogg","samples/grandpiano/key_f_036.ogg","samples/grandpiano/key_f_037.ogg","samples/grandpiano/key_f_038.ogg","samples/grandpiano/key_f_039.ogg","samples/grandpiano/key_f_040.ogg","samples/grandpiano/key_f_041.ogg","samples/grandpiano/key_f_042.ogg","samples/grandpiano/key_f_043.ogg","samples/grandpiano/key_f_044.ogg","samples/grandpiano/key_f_045.ogg","samples/grandpiano/key_f_046.ogg","samples/grandpiano/key_f_047.ogg","samples/grandpiano/key_f_048.ogg","samples/grandpiano/key_f_049.ogg","samples/grandpiano/key_f_050.ogg","samples/grandpiano/key_f_051.ogg","samples/grandpiano/key_f_052.ogg","samples/grandpiano/key_f_053.ogg","samples/grandpiano/key_f_054.ogg","samples/grandpiano/key_f_055.ogg","samples/grandpiano/key_f_056.ogg","samples/grandpiano/key_f_057.ogg","samples/grandpiano/key_f_058.ogg","samples/grandpiano/key_f_059.ogg","samples/grandpiano/key_f_060.ogg","samples/grandpiano/key_f_061.ogg","samples/grandpiano/key_f_062.ogg","samples/grandpiano/key_f_063.ogg","samples/grandpiano/key_f_064.ogg","samples/grandpiano/key_f_065.ogg","samples/grandpiano/key_f_066.ogg","samples/grandpiano/key_f_067.ogg","samples/grandpiano/key_f_068.ogg","samples/grandpiano/key_f_069.ogg","samples/grandpiano/key_f_070.ogg","samples/grandpiano/key_f_071.ogg","samples/grandpiano/key_f_072.ogg","samples/grandpiano/key_f_073.ogg","samples/grandpiano/key_f_074.ogg","samples/grandpiano/key_f_075.ogg","samples/grandpiano/key_f_076.ogg","samples/grandpiano/key_f_077.ogg","samples/grandpiano/key_f_078.ogg","samples/grandpiano/key_f_079.ogg","samples/grandpiano/key_f_080.ogg","samples/grandpiano/key_f_081.ogg","samples/grandpiano/key_f_082.ogg","samples/grandpiano/key_f_083.ogg","samples/grandpiano/key_f_084.ogg","samples/grandpiano/key_f_085.ogg","samples/grandpiano/key_f_086.ogg","samples/grandpiano/key_f_087.ogg","samples/grandpiano/key_f_088.ogg","samples/grandpiano/key_f_089.ogg","samples/grandpiano/key_f_090.ogg","samples/grandpiano/key_f_091.ogg","samples/grandpiano/key_f_092.ogg","samples/grandpiano/key_f_093.ogg","samples/grandpiano/key_f_094.ogg","samples/grandpiano/key_f_095.ogg","samples/grandpiano/key_f_096.ogg","samples/grandpiano/key_f_097.ogg","samples/grandpiano/key_f_098.ogg","samples/grandpiano/key_f_099.ogg","samples/grandpiano/key_f_100.ogg","samples/grandpiano/key_f_101.ogg","samples/grandpiano/key_f_102.ogg","samples/grandpiano/key_f_103.ogg","samples/grandpiano/key_f_104.ogg","samples/grandpiano/key_f_105.ogg","samples/grandpiano/key_f_106.ogg","samples/grandpiano/key_f_107.ogg","samples/grandpiano/key_f_108.ogg",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]',

  samplesSoundBank:
    '["samples/sounds/cric.ogg","samples/sounds/ok.ogg","samples/sounds/ko.ogg"]',

  programSet: [],
  program: 0,
  isNatural: [
    true,
    false,
    true,
    false,
    true,
    true,
    false,
    true,
    false,
    true,
    false,
    true,
  ],
  Keynames: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  octaves: 10,
  keyRange: [17, 97],
  renderRemoteSignals: false,

  DOMContainer: null,
  renderNoteName: false,
  renderNoteOctave: false,
  renderBlackNoteName: false,

  setProgram: function (id) {
    if (this.programSet[id] != undefined) {
      this.program = id
    } else return false
    return true
  },

  play: function (keyId, intensity) {
    var key = document.getElementById('key' + keyId)
    if (intensity != 0) {
      if (key && this.renderRemoteSignals == true) {
        if (this.isNatural[keyId % 12]) key.classList.add('button_press')
        else key.classList.add('button_halfTone_press')
      }
      this.programSet[this.program][keyId].volume = Math.abs(
        (intensity * 100) / 127 / 100
      )
      this.programSet[this.program][keyId].currentTime = 0
      this.programSet[this.program][keyId].play()
    } else if (key) {
      if (this.isNatural[keyId % 12]) key.classList.remove('button_press')
      else key.classList.remove('button_halfTone_press')
    }
  },

  init: function (DOMContainer) {
    this.loadSoundBank(this.defaultSoundBank, 0, function () {
      piano.draw(DOMContainer)
    })
  },

  loadSoundBank: function (soundbankDef, programID, callback) {
    var callback = callback
    var SoundLoaded = function () {
      if (++loadedSamples == totalSamples) {
        console.log('JSPiano: Loaded ' + loadedSamples + ' samples')
        callback()
      }
    }
    var progress = function (e) {
      console.log(e)
    }

    var programDef = JSON.parse(soundbankDef)
    this.programSet[programID] = []
    var totalSamples = 0
    var loadedSamples = 0
    for (var sample in programDef) if (programDef[sample]) totalSamples++
    for (var sample in programDef) {
      this.programSet[programID][sample] = document.createElement('audio')
      this.programSet[programID][sample].src = programDef[sample]
      this.programSet[programID][sample].type = 'audio/ogg'
      this.programSet[programID][sample].preload = 'auto'

      //this.programSet[programID][sample].addEventListener('canplay',SoundLoaded(), false);
      this.programSet[programID][sample].addEventListener(
        'loadeddata',
        SoundLoaded,
        true
      )
    }
  },

  draw: function (DOMContainer) {
    pianorollCont = document.getElementById(DOMContainer || this.DOMContainer)

    // validate Container existence, trowh error if not, or cache object if exist.
    if (!pianorollCont)
      throw new Error(
        "Piano.draw() : Container '" +
          DOMContainer +
          "'does not exist! Aborting..."
      )
    else this.DOMContainer = DOMContainer || this.DOMContainer

    // clear provided piano container
    pianorollCont.innerHTML = ''

    // retrieve Piano Keys Width from CSS definition (creates a temp Piano Key Element and check the CSS propiety value)
    // - Tone Key
    var _tmpKey = document.createElement('div')
    _tmpKey.className = 'button'
    pianorollCont.appendChild(_tmpKey)
    var widthTone = _tmpKey.offsetWidth
    _tmpKey.parentNode.removeChild(_tmpKey)
    delete _tmpKey
    // - Half Tone Key
    var _tmpKey = document.createElement('div')
    _tmpKey.className = 'button_halfTone'
    pianorollCont.appendChild(_tmpKey)
    var widthHalfTone = _tmpKey.offsetWidth
    _tmpKey.parentNode.removeChild(_tmpKey)
    delete _tmpKey

    // loop the scale across the octaves and create a piano key in each cicle
    pianorollCont.innerHTML = ''
    var octaveBarCont = document.createElement('div')
    octaveBarCont.id = 'octaveBarCont'
    pianorollCont.appendChild(octaveBarCont)

    var newKey = null
    var newKeyName = null
    var keyID = 0
    var position = 0
    var octaveBarWidth = 0
    // iterate octaves
    for (var o = 0; o <= this.octaves - 1; o++) {
      // iterate notes
      for (var n = 1; n <= 12; n++) {
        keyID = o * this.Keynames.length + n - 1
        newKey = document.createElement('div')
        newKey.className = this.isNatural[n - 1] ? 'button' : 'button_halfTone'
        newKey.style.position = 'absolute'
        newKey.id = 'key' + keyID
        //if key is out of render range, jump to next cicle
        if (keyID < this.keyRange[0] || keyID > this.keyRange[1]) continue

        // create piano top, octave bar (visual aggrupation of notes)
        if (n == 1 || keyID == this.keyRange[1]) {
          octaveBar = document.createElement('div')
          octaveBar.className =
            (o % 2 == 0) * (keyID != this.keyRange[1])
              ? 'octaveBarGreen'
              : 'octaveBarRed'
          octaveBar.style.width = octaveBarWidth + 'px'
          octaveBarCont.appendChild(octaveBar)
          octaveBarWidth = 0
        }

        // evaluate current key condition and render, white or black key.
        if (this.isNatural[n - 1]) {
          // WHITE KEY!
          newKey.style.left = position + 'px'
          position += widthTone
          octaveBarWidth += widthTone
          // add Key Note Name Tag, if necessary
          if (this.renderNoteName == true) {
            newKeyName = document.createElement('div')
            newKeyName.className = 'button_name'
            // if add octave to Tag if necessary
            newKeyName.innerHTML =
              this.renderNoteOctave == true
                ? this.Keynames[n - 1] + (o - 1)
                : this.Keynames[n - 1]
            newKey.appendChild(newKeyName)
          }
        } else {
          // BLACK KEY!
          newKey.style.left = position - Math.abs(widthHalfTone / 2) + 'px'
          // add Key Note Name Tag, if necessary
          if (this.renderBlackNoteName == true) {
            newKeyName = document.createElement('div')
            newKeyName.className = 'button_name button_halfTone_name'
            // if add octave to Tag if necessary
            newKeyName.innerHTML =
              this.renderNoteOctave == true
                ? this.Keynames[n - 1] + (o - 1)
                : this.Keynames[n - 1]
            newKey.appendChild(newKeyName)
          }
        }
        pianorollCont.appendChild(newKey)

        // piano key events handler
        newKey.onmousedown = (function (_t, _k) {
          return function (e) {
            // force user keypress action, be renderer
            var BACKUP_renderRemoteSignals = _t.renderRemoteSignals
            _t.renderRemoteSignals = true
            _t.play(_k, 127)
            _t.renderRemoteSignals = BACKUP_renderRemoteSignals
          }
        })(this, keyID)
        newKey.onmouseup = (function (_t, _k) {
          return function (e) {
            _t.play(_k, 0)
          }
        })(this, keyID)
        newKey.onmouseout = (function (_t, _k) {
          return function (e) {
            _t.play(_k, 0)
          }
        })(this, keyID)
      }
    }
  },
}
