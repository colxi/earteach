var TEST = {
  messageTimer: null,
  playQueue: new Array(),

  // ids of current trainer, preset , and preset available anwser values array
  currentTrainerIndex: null,
  currentPresetIndex: null,
  presetObj: null,
  items: [],

  // default test engine specs
  arpeggiated: true,
  arpegioSpeed: 500,
  noteFadeOut: 3000,
  showPianoNotes: false,

  // round vars
  roundAnswers: [],
  anwserIndex: null,
  lastNotes: null,

  // current test stats counter
  counter: {
    round: 0,
    totalRounds: 0,
    succes: 0,
    failure: 0,
  },

  /* TEST Methods */

  start: function (trainerIndex, presetIndex, presetCustomFLAG) {
    /*
		/ Initialices the TEST for new test
		*/
    var presetCustomFLAG = presetCustomFLAG || false

    // throw error if provided trainer is unkwnown or undefined
    if (trainerIndex == undefined || TRAINERS[trainerIndex] == undefined)
      throw new Error('Unknown trainer.')

    // throw error if provided preset is unkwnown or undefined
    if (!trainerIndex)
      if (
        presetIndex == undefined ||
        TRAINERS[trainerIndex].presets[presetIndex] == undefined
      )
        throw new Error('Unknown preset.')
      else if (trainerIndex)
        if (
          presetIndex == undefined ||
          TRAINERS[trainerIndex].presetsCustom[presetIndex] == undefined
        )
          throw new Error('Unknown preset.')

    // initilize / import trainer & preset config
    this.presetObj = presetCustomFLAG
      ? TRAINERS[trainerIndex].presetsCustom[presetIndex]
      : TRAINERS[trainerIndex].presets[presetIndex]
    this.currentTrainerIndex = trainerIndex
    this.currentPresetIndex = presetIndex
    this.counter.round = 1
    this.counter.totalRounds = TRAINERS[trainerIndex].rounds || 10
    this.counter.succes = 0
    this.counter.failure = 0
    this.items = []

    // set arpegio mode on/off
    this.arpeggiated = this.presetObj.arpeggiated || false

    // add preset allowed items to TEST
    this.items = this.presetObj.items

    // add the 'Preset Question' text to Trainer Header (GUI)
    document.getElementById('trainerQuestion').innerHTML = __(
      TRAINERS[trainerIndex].question
    )

    // set Retry Button behavior
    document.getElementById('retryBut').onclick = function () {
      TEST.forceMute()
      TEST.muteAndPlay(TEST.lastNotes)
    }

    // init sidebar counter (GUI)
    document.getElementById('trainerSidebarCounterSucces').innerHTML = 0
    document.getElementById('trainerSidebarCounterFailure').innerHTML = 0

    // initiation message
    this.showMessage(__('Initiating Test...'), 3000)

    // allow user read initiation message, and launch new round
    setTimeout(this.newRound, 2000)

    return true
  },
  newRound: function () {
    /*
		/
		*/

    // if 'Last round' has been reachedn terminate trainer , else start new round
    if (TEST.counter.round > TEST.counter.totalRounds) {
      TEST.complete()
      return false
    }

    // force to Mute posible sounds in queue (destroy queue)
    TEST.forceMute()

    // set preset configuration for notes render in piano
    piano.renderRemoteSignals = TEST.showPianoNotes

    // new Round message
    TEST.showMessage(
      __('Round ') +
        TEST.counter.round +
        ' ' +
        __('of') +
        ' ' +
        TEST.counter.totalRounds +
        '...'
    )

    // clear trainerAnswers DIV...
    document.getElementById('trainerAnswers').innerHTML = ''

    // initialize last answers array
    TEST.roundAnswers = []

    // generate RANDOM ANSWER (TEST.items array index value)
    TEST.anwserIndex = Math.round(Math.random() * (TEST.items.length - 1))

    // generato ROOT note
    var root = JSHarmony.randomNote()

    // Fill trainerAnswers DIV with possible anwsers
    // but before check number of items to render, and lenght of
    // each string, to assign large or small buttons
    var answerbutClass = 'answerBut'
    for (var i = 0; i <= TEST.items.length - 1; i++) {
      if (i > 5 || __(TEST.items[i].name).length > 9)
        answerbutClass = 'answerButSmall'
    }

    // generate each button , and associate to it (within data-notes) the corresponding notes
    var answerbut = null
    for (var i = 0; i <= TEST.items.length - 1; i++) {
      // generate posible anwser
      TEST.roundAnswers[i] = TRAINERS[TEST.currentTrainerIndex].constructor(
        i,
        root
      )
      // create button
      answerbut = document.createElement('div')
      answerbut.className = answerbutClass
      answerbut.setAttribute('data-anwserIndex', i)
      answerbut.innerHTML = __(TEST.items[i].name)
      document.getElementById('trainerAnswers').appendChild(answerbut)
      // button click event handler
      answerbut.onclick = function (event) {
        TEST.evaluation(event.target.getAttribute('data-anwserIndex'))
      }
    }

    // play round notes ...with some delay (to allow user to relax for a while)
    setTimeout(function () {
      TEST.noteOn(TEST.roundAnswers[TEST.anwserIndex])
    }, 500)

    // done!
    return true
  },
  complete: function () {
    /*
		/ Display Hit Rate, and return to trainerID presets list, and updates
		/ user stats
		*/

    // force to Mute posible sounds in queue (destroy queue)
    TEST.forceMute()

    // update score stats
    var newScore = Math.round(
      (this.counter.succes * 100) / this.counter.totalRounds
    )

    this.presetObj.completed++

    score = this.presetObj.score
    comp = this.presetObj.completed

    this.presetObj.score = (score * (comp - 1) + newScore) / comp

    // show stats result message
    this.showMessage(__('Test completed. Hit Rate: ') + newScore + '%', 5000)

    // if ONLINE MODE enabled, update user stats in DB
    if (SESSION.onlineMode == true) {
      STORAGE.saveTestResult(this.presetObj.id, newScore)
    }

    setTimeout('GUI.render.presetsGrid(' + this.currentTrainerIndex + ')', 4000)
    return true
  },
  evaluation: function (anwserIndexSelected) {
    /*
		/ Evaluates the provided anwser by user
		*/

    // force to Mute posible sounds in queue (destroy queue)
    TEST.forceMute()

    var succeed = anwserIndexSelected == TEST.anwserIndex ? true : false

    // evaluate answer
    if (succeed == true) this.counter.succes++ // incrfease succes couner
    else this.counter.failure++ // increase fail counter

    // play corresponding sound (fail/succes)
    piano.setProgram(1)
    piano.play(succeed ? 1 : 2, 100)
    piano.setProgram(0)

    // increase round counter
    this.counter.round++

    // update GUI counter
    document.getElementById('trainerSidebarCounterSucces').innerHTML =
      TEST.counter.succes
    document.getElementById('trainerSidebarCounterFailure').innerHTML =
      TEST.counter.failure

    if (succeed) this.newRound()
    else this.anwserFailure(anwserIndexSelected)

    return true
  },
  abort: function () {
    /*
		/	User abortion of trainer (return button?).
		*/

    // restore piano render default configuration
    piano.renderNoteName = CONFIG.piano.renderNoteName
    piano.renderBlackNoteName = CONFIG.piano.renderBlackNoteName
    piano.draw()

    // mute piano current notes
    TEST.forceMute()

    // load previous menu
    GUI.render.presetsGrid(TEST.currentTrainerIndex, TEST.currentPresetIndex)
    return true
  },

  /* Audio methods (connection with JSPiano) */

  forceMute: function () {
    /*
		/ Force muting piano, silencing lasnotes, and destroying sound events buffer
		*/

    // delete all pending sound events
    for (var i = 0; i < TEST.playQueue.length; i++)
      clearTimeout(TEST.playQueue[i])

    delete TEST.playQueue
    TEST.playQueue = new Array()

    // silence all possible sounding notes
    TEST.noteOff(this.lastNotes)

    // done!
    return true
  },
  muteAndPlay: function (note) {
    TEST.forceMute()
    TEST.noteOn(note)
    return true
  },
  noteToKey: function (note) {
    /*
		/ noteToKey recieve a Note Object, and  converts it to a
		/ Piano key ID (based on MIDI key assigment specifications)
		*/

    // scale definition
    notesStruct = [
      'C',
      null,
      'D',
      null,
      'E',
      'F',
      null,
      'G',
      null,
      'A',
      null,
      'B',
    ]

    // find key ID
    var key =
      note.octave == -1
        ? notesStruct.indexOf(note.name)
        : note.octave * 12 + 12 + notesStruct.indexOf(note.name)

    // modify the key if there are accidentals in original note, to apply
    for (var i = 0; i < note.accidentals.length; i++) {
      if (note.accidentals[i] == '#') key++
      else if (note.accidentals[i] == 'b') key--
    }

    // done!
    return key
  },
  noteOn: function (notesHandler) {
    /*
		/ Play a note, or set of notes, from multiple sources
		/ Can deal with: Note Object | Object with .notes atribute (and valid Array of Notes inside) | array of notes
		*/

    // obtain array of notes, (toNotesArray operates with many notes sources, and also validates input)
    var notes = JSHarmony.toNotesArray(notesHandler)

    // log current notes
    TEST.lastNotes = notes

    // iterate over the notes array
    for (var i = 0; i <= notes.length - 1; i++) {
      if (TEST.arpeggiated == true) {
        // schedule note play, for arpegiated mode
        TEST.playQueue.push(
          setTimeout(
            'piano.play(' + TEST.noteToKey(notes[i]) + ' , 100)',
            i * TEST.arpegioSpeed
          )
        )
      } else {
        // play note
        piano.play(TEST.noteToKey(notes[i]), 100)
      }
    }

    // schedule the release key event
    TEST.playQueue.push(
      setTimeout(function () {
        TEST.noteOff(notes)
      }, TEST.noteFadeOut)
    )
    return true
  },
  noteOff: function (notesHandler) {
    /*
		/ mute a note (play with intenity = 0 mutes the note), or set of notes, from multiple sources
		/ Can deal with: Note Object | Object with .notes atribute (and valid Array of Notes inside) | array of notes
		*/

    if (notesHandler == undefined) {
      if (notesHandler != undefined) var notesHandler = this.lastNotes
      else return false
    }

    // obtain array of notes, (toNotesArray operates with many notes sources, and also validates input)
    var notes = JSHarmony.toNotesArray(notesHandler)

    // iterate over the notes array
    for (var i = 0; i <= notes.length - 1; i++) {
      if (TEST.arpeggiated == true) {
        // schedule note play, for arpegiated mode
        TEST.playQueue.push(
          setTimeout(
            'piano.play(' + TEST.noteToKey(notes[i]) + ' , 0)',
            i * TEST.arpegioSpeed
          )
        )
      } else {
        // play note
        piano.play(TEST.noteToKey(notes[i]), 0)
      }
    }

    // done!
    return true
  },

  /* GUI methods */
  anwserFailure: function (choosenIndex) {
    /*
		/
		*/

    // remove any previous existing message hidding timeout
    clearInterval(this.messageTimer)

    // render Notes in piano, for easier anwser understanding & vsualization
    piano.renderNoteName = true
    piano.renderBlackNoteName = true
    piano.draw()

    // show message
    var _html = ''
    _html += "<div id='trainerMessagesFailureTitle'>"
    _html +=
      "<span class='exclamationBig'>" +
      __('Incorrect') +
      '!</span><span> ' +
      __("It's") +
      " '" +
      __(TEST.items[TEST.anwserIndex].name) +
      "' " +
      __('not') +
      " '" +
      __(TEST.items[choosenIndex].name) +
      "'.</span>"
    _html += '</div>'
    _html += "<div class='whiteSubtitleBig'>"
    _html += __('Feel the difference') + ':'
    _html += '</div>'
    _html += '<div>'
    _html +=
      "<div id='correctAnwser' class='answerButSmall' data-anwserIndex='" +
      TEST.anwserIndex +
      "' onclick='TEST.muteAndPlay(TEST.roundAnswers[" +
      TEST.anwserIndex +
      "])'>"
    _html += __(TEST.items[TEST.anwserIndex].name)
    _html += '</div>'
    _html +=
      "<div class='answerButSmall' data-anwserIndex='" +
      choosenIndex +
      "' onclick='TEST.muteAndPlay(TEST.roundAnswers[" +
      choosenIndex +
      "])'>"
    _html += __(TEST.items[choosenIndex].name)
    _html += '</div>'
    _html += '</div>'

    _html += "<div class='padding10'></div>"

    _html += "<div id='mesageScreen_butContainer'>"
    _html += "<div id='ok_button'></div>"
    _html += "<div class='clear'></div>"
    _html += '</div>'

    document.getElementById('trainerMessages').innerHTML = _html
    document.getElementById('trainerMessages').removeAttribute('hidden')

    document.getElementById('ok_button').onclick = function () {
      // restore piano render default configuration
      piano.renderNoteName = CONFIG.piano.renderNoteName
      piano.renderBlackNoteName = CONFIG.piano.renderBlackNoteName
      piano.draw()
      // throw new round
      TEST.newRound()
      return true
    }

    TEST.forceMute()
    piano.renderRemoteSignals = true
    return true
  },
  showMessage: function (_msg, _time) {
    /*
		/ Display trainerMessages for _time (ms) with provided message (_msg)
		/ if no _time is provided, message will be displayed default time (3000ms)
		*/

    // if not anymore in trainer screen, abort
    if (!document.getElementById('trainerContainer')) return false

    // remove any previous existing message hidding timeout
    clearInterval(this.messageTimer)

    if (_msg == undefined) return false
    if (_time == undefined) _time = 3000

    // show message
    document.getElementById('trainerMessages').innerHTML = _msg
    document.getElementById('trainerMessages').removeAttribute('hidden')
    // shedule message hidding (if trainerMessages DIV is still in the DOM)
    this.messageTimer = setTimeout(function () {
      if (document.getElementById('trainerMessages')) {
        document.getElementById('trainerMessages').setAttribute('hidden', true)
      }
    }, _time)
    return true
  },
}
