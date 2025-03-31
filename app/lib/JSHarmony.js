/*
	Project Name: JSHarmony
	Version: 1.2 (03/05/2013)
	Author: colxi
	Author URI: https://www.colxi.info/
	Description: JSHarmony library is a set of musical related fuctions and definitions  
	dessigned to generate Chords, Notes, Intervals, Scales...
	Provide some custom Objects types, and validations functions.
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

/*
/	Object types constructors
*/

function Note() {
  this.name = null
  this.accidentals = new Array()
  this.octave = null
  this.duration = null
}

function Interval() {
  this.grade = null
  this.quality = null
  this.direction = null
  this.notes = new Array()
}

function Chord() {
  this.type = null
  this.notes = new Array()
}

function Sequence() {
  return []
}

/*
/	JSHarmony class
*/

JSHarmony = (function () {
  return {
    def: {
      scale: {
        /*
				/ Definition of reference scale, and tones/semitones ditance betwen grades 
				*/

        hasTone: [true, true, false, true, true, true, false],
        notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
      },
      accidentals: {
        /*
				/ Definition of note accidentals and its distance modifications 
				*/

        '#': 0.5,
        b: -0.5,
      },
      intervals: {
        /*
				/ Definition of the interval grades and their possible qualities
				/ Qualities equivalences: 
				/		M 	= Major 			m 	= minor
				/		aug = augmented	 	 	dim = diminished 
				/		P 	= perfect
				*/

        1: {
          P: 0,
        },
        2: {
          dim: 0,
          m: 0.5,
          M: 1,
          aug: 1.5,
        },
        3: {
          dim: 1.0,
          m: 1.5,
          M: 2,
          aug: 2.5,
        },
        4: {
          dim: 2,
          P: 2.5,
          aug: 3,
        },
        5: {
          dim: 3,
          P: 3.5,
          aug: 4,
        },
        6: {
          dim: 3.5,
          m: 4,
          M: 4.5,
          aug: 5,
        },
        7: {
          dim: 4.5,
          m: 5,
          M: 5.5,
          aug: 6,
        },
        8: {
          dim: 5.5,
          P: 6,
          aug: 6.5,
        },
      },
      scales: {
        /*
				/ Scales definitions, categorized by mode. 
				/
				/	direction		/------------------------ascending--------------------------\	/--descending scale name--\
				/	gades:	 		 1		2		3		4		5		6		7		8
				*/
        major: {
          ionian: [['P', 'M', 'M', 'P', 'P', 'M', 'M', 'P'], 'ionian'],
        },
        minor: {
          aeolian: [['P', 'M', 'm', 'P', 'P', 'm', 'm', 'P'], 'aeolian'],
          harmonic: [['P', 'M', 'm', 'P', 'P', 'm', 'M', 'P'], 'harmonic'],
          bachian: [['P', 'M', 'm', 'P', 'P', 'M', 'M', 'P'], 'bachian'],
          melodic: [['P', 'M', 'm', 'P', 'P', 'M', 'M', 'P'], 'aeolian'],
        },
      },
      modes: {
        ionian: ['P', 'M', 'M', 'P', 'P', 'M', 'M', 'P'],
        dorian: ['P', 'M', 'm', 'P', 'P', 'M', 'm', 'P'],
        phrygian: ['P', 'm', 'm', 'P', 'P', 'm', 'm', 'P'],
        lydian: ['P', 'M', 'M', 'aug', 'P', 'M', 'M', 'P'],
        mixolydian: ['P', 'M', 'M', 'P', 'P', 'M', 'm', 'P'],
        aeolian: ['P', 'M', 'm', 'P', 'P', 'm', 'm', 'P'],
        locrian: ['P', 'm', 'm', 'P', 'dim', 'm', 'm', 'P'],
      },
      tetrachords: {
        /*
				/ Tetrachords definitions. 
				/ Row structure Specifications:
				/ tetrachord_name  :Array(Grade1 Distance, Grade2 Distance, [...] ),
				*/

        major: [1, 1, 0.5],
        minor: [1, 0.5, 1],
        armonic: [0.5, 1.5, 0.5],
        phrygian: [0.5, 1, 1],
      },
      chords: {
        /*
				/ Chords definitions. 
				/ Row structure Specifications:
				/ chord_name  :Array( Array(grade,quality), Array(grade,quality), [...] ),
				*/

        major: [
          [1, 'P'],
          [3, 'M'],
          [5, 'P'],
        ],
        minor: [
          [1, 'P'],
          [3, 'm'],
          [5, 'P'],
        ],
        dim: [
          [1, 'P'],
          [3, 'm'],
          [5, 'dim'],
        ],
        aug: [
          [1, 'P'],
          [3, 'M'],
          [5, 'aug'],
        ],
        max7: [
          [1, 'P'],
          [3, 'M'],
          [5, 'P'],
          [7, 'M'],
        ],
        m7: [
          [1, 'P'],
          [3, 'm'],
          [5, 'P'],
          [7, 'm'],
        ],
        7: [
          [1, 'P'],
          [3, 'M'],
          [5, 'P'],
          [7, 'm'],
        ],
        semidim: [
          [1, 'P'],
          [3, 'm'],
          [5, 'dim'],
          [7, 'm'],
        ],
      },
    },

    /*
		/ Some generic methods
		*/

    objType: function (obj) {
      if (obj == undefined || obj == null) return 'Unkwnown'
      return obj.constructor.name || 'Unkwnown'
    },
    isArray: function (obj) {
      if (obj == undefined || obj == null) return false
      return Object.prototype.toString.call(obj) === '[object Array]'
        ? true
        : false
    },
    isInt: function (integer) {
      if (integer == undefined || integer == null) return false
      return parseInt(integer, 10) == NaN ? false : true
    },
    randomBoolean: function () {
      return Math.round(Math.random()) ? true : false
    },
    randomKey: function (array) {
      if (array == undefined || array == null) return false
      return array[Math.round(Math.random() * (array.length - 1))]
    },

    /*
		/ some musical specific methods (boolean returns)
		*/

    isChordName: function (chordName) {
      if (chordName == undefined || chordName == null) return false
      if (this.def.chords[chordName] == undefined) return false
      else true
    },
    isNoteName: function (note) {
      if (note == undefined || note == null) return false
      return this.def.scale.notes.indexOf(note) == -1 ? false : true
    },
    isNoteArray: function (array) {
      if (array == undefined || array == null) return false
      if (this.isArray(array) == false) {
        return false
      } else {
        for (var i = 0; i < array.length; i++) {
          if (this.isNote(array[i]) == false) {
            return false
          }
        }
      }
      return true
    },
    isAccidentalsArray: function (array) {
      if (array == undefined || array == null) return false
      if (this.isArray(array) == false) return false
      else
        for (var i = 0; i < array.length; i++)
          if (array[i] != 'b' && array[i] != '#') return false
      return true
    },
    isNote: function (noteObj) {
      if (noteObj == undefined || noteObj == null) return false
      if (this.objType(noteObj) != 'Note') return false
      else if (this.isNoteName(noteObj.name) == false) return false
      else if (this.isAccidentalsArray(noteObj.accidentals) == false)
        return false
      else if (this.isInt(noteObj.octave) == false) return false
      return true
    },
    isMode: function (mode) {
      if (mode == undefined || mode == null) return false
      if (mode != 'major' && mode != 'minor') return false
      return true
    },
    scaleExist: function (mode, scale) {
      if (this.isMode == false) return false
      if (this.def.scales[mode][scale] == undefined) return false
      return true
    },
    toNotesArray: function (notesHandler) {
      /*
			/ Can extract notes and convert them to Array Of notes from diferent sources
			/ like Note Object , Note Array, Any object with propiety .notes (and array of notes inside)
			*/

      // Validate input...
      if (notesHandler == undefined || notesHandler == null)
        throw new Error('(function: toNotesArray) Undefined input.')
      if (
        this.objType(notesHandler) != 'Note' &&
        this.isNoteArray(notesHandler) == false &&
        notesHandler.notes == undefined
      )
        throw new Error('(function: toNotesArray) Unknown input')
      if (this.isNoteArray(notesHandler.notes == false))
        throw new Error('(function: toNotesArray) Unkwnown encoding')

      var notes = new Array()
      // select aproiate source of notes...
      // if is a Note Object
      if (this.objType(notesHandler) == 'Note') notes[0] = notesHandler
      // if is a Notes Array
      else if (this.isNoteArray(notesHandler)) notes = notesHandler
      // if has propiety .nodes
      else notes = notesHandler.notes

      // done!
      return notes
    },

    /*
		/ GENERATORS
		*/

    makeScale: function (mode, name, root) {
      /*
			/	Generate asending and descending notes for requested scale. Returns an Array of notes.
			/	Arguments:
			/		mode (string) 		: 'major' | 'minor'
			/		name (string) 		: check this.def.scales.major &&  this.def.scales.minor definitions
			/		root (Note Object)	: scale tonic Note Object
			*/

      // input validation
      if (this.isMode(mode) == false) throw new Error('Invalid mode provided')
      if (this.scaleExist(mode, name) == false)
        throw new Error('Invalid scale name provided')
      if (this.isNote(root) == false)
        throw new Error('Invalid Note object provided')

      // generate scale acending
      var scaleUp = new Array()
      for (var i = 0; i < 8; i++) {
        scaleUp.push(
          this.makeIntervalNote(
            i + 1,
            this.def.scales[mode][name][0][i],
            'asc',
            root
          )
        )
      }

      // generate scale descending
      var scaleDown = new Array()
      for (var i = 0; i < 8; i++) {
        scaleDown.push(
          this.makeIntervalNote(
            i + 1,
            this.def.scales[mode][this.def.scales[mode][name][1]][0][i],
            'asc',
            root
          )
        )
      }
      scaleDown.reverse()

      // join notes
      var scale = scaleUp.concat(scaleDown)

      // done!
      return scale
    },
    randomChord: function (root, type) {
      /*
			/ Return a random Chord (Chord Object), complete randomly, or filling
			/ the undespecified attributs.
			/ Arguments:
			/ 		root		: Note Object
			/ 		type		: String ('maj' | 'min' | 'aug' | [...]) (More in: JSHarmony.def.chords)
			*/

      // validate input...
      if (root != undefined && this.isNote(root) == false)
        throw new Error('Invalid Note object provided')
      if (type != undefined && this.isChordName(type) == false)
        throw new Error('Invalid Chord Type provided')

      // generate 'root' and 'type' if not provided
      if (root == undefined) var root = this.randomNote()
      if (type == undefined) var type = this.randomKey(this.def.chords)

      // generate chord
      var chord = this.makeChord(root, type)

      return chord
    },
    randomNote: function (name, accidentals, octave) {
      /*
			/ Return a random Note (Note Object), complete randomly, or filling
			/ the undespecified attributs.
			/ Arguments:
			/ 		name		: String ('C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B')
			/ 		accidentals	: Array of Strings ('b' | '#')
			/		octave		: Positive Integer
			*/

      // input validation
      if (name != undefined && this.isNoteName(name) == false)
        throw new Error("Invalid note 'name' value provided.")
      if (accidentals != undefined && isAccidentalsArray(accidentals))
        throw new Error("Invalid 'accidentals' value provided.")
      if (octave != undefined && this.isInt(octave) == false)
        throw new Error("Invalid 'octave' value provided.")

      // randomize note name if not provided
      if (name == undefined) var name = this.randomKey(this.def.scale.notes)

      // randomize accidentals if not provided
      switch (accidentals) {
        case undefined:
          // randomization requested
          var accidentals = new Array()
          if (this.randomBoolean())
            accidentals[0] = this.randomBoolean() ? '#' : 'b'
          break
        case null:
          // explicit: no accidentals request, create empty array
          var accidentals = new Array()
          break
      }

      // randomize octave if not provided
      if (octave == undefined) var octave = Math.round(Math.random() * 3) + 1

      var note = new Note()
      note.name = name
      note.accidentals = accidentals
      note.octave = octave

      // done!
      return note
    },
    makeIntervalNote: function (grade, quality, direction, root) {
      /*
			/ Returns the note (note Object), away 'number' of grades from root, in the requested
			/ direcion, and with the requested quality.
			/ Arguments:
			/ 		grade		: Positive Integer
			/ 		quality		: String ('dim' | 'm' | 'M' | 'P' | 'aug')
			/		direction	: String ('asc' | 'desc')
			/		root		: Note Object
			*/

      // validate input...
      if (this.isInt(grade) == false)
        throw new Error("Invalid interval 'grade' provided")
      if (
        quality == undefined ||
        this.def.intervals[grade % 7 || 7][quality] == undefined
      )
        throw new Error(
          "Invalid interval 'quality' for provided interval grade"
        )
      if (direction == undefined || (direction != 'asc' && direction != 'desc'))
        throw new Error("Invalid 'direction' provided")
      if (this.isNote(root) == false)
        throw new Error("Invalid 'root' note Object provided")

      // get the root note index (from the tones definition table)
      var rootIndex = this.def.scale.notes.indexOf(root.name)

      // convert interval to interval Simple (when interval is > 7)
      var intervalSimple = grade % 7 || 7

      // get note name
      var note = new Note()
      note.name =
        this.def.scale.notes[
          direction == 'asc'
            ? (rootIndex + intervalSimple - 1) % 7
            : (rootIndex + (9 - intervalSimple) - 1) % 7
        ]

      // get distance in semitones from root to intervalic note (force ASCENDING MODE, if necessary later will make inversion)
      var crawler = rootIndex
      var semitones = 0
      // <--- PATCH! Diferenciate betwen directions, to manage properly 8J interval from root with accidentals  ---->
      if (direction == 'asc') {
        while (this.def.scale.notes[crawler] != note.name) {
          semitones = this.def.scale.hasTone[crawler]
            ? semitones + 1
            : semitones + 0.5
          crawler = crawler < 6 ? crawler + 1 : 0
        }
      } else if (direction == 'desc') {
        do {
          semitones = this.def.scale.hasTone[crawler]
            ? semitones + 1
            : semitones + 0.5
          crawler = crawler < 6 ? crawler + 1 : 0
        } while (this.def.scale.notes[crawler] != note.name)
      }
      // if root has accidentals, add/sustract corresponging semitones to the semitones counter
      for (var i = 0; i < root.accidentals.length; i++)
        semitones += this.def.accidentals[root.accidentals[i]] * -1

      // convert to descending interval if necessry
      if (direction == 'desc' && semitones != 0) semitones = 6 - semitones

      // compare current interval semitones, with interval definition table
      var distanceDiference =
        this.def.intervals[intervalSimple][quality] - semitones
      if (distanceDiference != 0) {
        if (distanceDiference > 0) {
          var accidentalSymbol = direction == 'asc' ? '#' : 'b'
          semitones = direction == 'asc' ? semitones + 0.5 : semitones - 0.5
        } else if (distanceDiference < 0) {
          var accidentalSymbol = direction == 'asc' ? 'b' : '#'
          semitones = direction == 'asc' ? semitones - 0.5 : semitones + 0.5
        }
      }
      // add accidentals to interval note, to match interval quality distances definition
      for (var a = 0; a < Math.abs(distanceDiference / 0.5); a++)
        note.accidentals[a] = accidentalSymbol

      // calculate octave
      var position = this.def.scale.notes.indexOf(root.name)
      var octaveModificator = 0
      for (var i = 0; i < grade; i++) {
        if (position > 6) {
          position = 0
          octaveModificator++
        } else if (position < 0) {
          position = 6
          octaveModificator--
        }
        position = direction == 'asc' ? position + 1 : position - 1
      }
      note.octave = root.octave + octaveModificator

      // done!
      return note
    },
    makeInterval: function (grade, quality, direction, root) {
      /*
			/ Returns an Interval Object, with the interval definition meta-data, 
			/ root note and interval note (interval.note[0] and interval.note[1]).
			/ Arguments:
			/ 		grade		: Positive Integer
			/ 		quality		: String ('dim' | 'm' | 'M' | 'P' | 'aug')
			/		direction	: String ('asc' | 'desc')
			/		root		: Note Object
			*/

      // validate input
      if (this.isInt(grade) == false)
        throw new Error("Invalid interval 'grade' provided")
      if (
        quality == undefined ||
        this.def.intervals[grade % 7 || 7][quality] == undefined
      )
        throw new Error(
          "Invalid interval 'quality' for provided interval grade"
        )
      if (direction == undefined || (direction != 'asc' && direction != 'desc'))
        throw new Error("Invalid 'direction' provided")
      if (this.isNote(root) == false)
        throw new Error("Invalid 'root' note provided")

      // create Interval Object
      var interval = new Interval()
      interval.grade = grade
      interval.quality = quality
      interval.direction = direction
      interval.notes.push(root)

      // get intervalic note
      var note = this.makeIntervalNote(grade, quality, direction, root)

      // add note to interval.notes
      interval.notes.push(note)

      return interval
    },
    makeChordFromGrade: function (tonallityRootNote, grade, mode, triad_FLAG) {
      var chordType = this.getChordTypeFromGrade(grade, mode, triad_FLAG)
      var chord = this.makeChord(tonallityRootNote, chordType)
      return chord
    },
    getChordTypeFromGrade: function (grade, mode, triad_FLAG) {
      var triad_FLAG = triad_FLAG || true

      // get the Mode corresponding to requested grade
      var gradeMode = this.getGradeMode(grade, mode)

      // get chord note intervals from corresponding grade
      var intervals = []
      intervals[0] = this.def.modes[gradeMode][0]
      intervals[1] = this.def.modes[gradeMode][2]
      intervals[2] = this.def.modes[gradeMode][4]
      if (triad_FLAG) intervals[3] = this.def.modes[gradeMode][6]

      // search in all chords definitions, for intervals coincidences
      var found
      var chordType = null
      //iterate over each chord
      for (var chord in this.def.chords) {
        found = true
        // if notes lenght doesn't match jump to next loop
        if (intervals.length != this.def.chords[chord].length) continue
        // else, iterate iver each interval
        for (var i = 0; i < intervals.length; i++) {
          if (intervals[i] !== this.def.chords[chord][i][1]) {
            found = false
            break
          }
        }
        // if any mismatch happened, succeed! chord name found.
        if (found == true) {
          chordType = chord
          break
        }
      }

      // done!
      //console.log(chordType);
      return chordType
    },
    getGradeMode: function (grade, mode) {
      var mode = mode || 'ionian'
      var modesList = Object.keys(this.def.modes)
      requestedModeIndex = modesList.indexOf(mode)
      gradeMode = modesList[(requestedModeIndex + grade - 1) % 7 || 0]

      //console.log(modesList);
      //console.log("Requested index ("+ mode +") is: " + requestedModeIndex);
      //console.log("Requested grade ("+ grade +") of mode '" + mode + "' is grade I from mode: " + gradeMode);
      //console.log(this.def.modes[gradeMode])

      return gradeMode
    },
    makeChord: function (root, type) {
      /*
			/ Return a Chord (Chord Object),  constructed with specified attributs.
			/ Arguments:
			/ 		root		: Note Object
			/ 		type		: String ('maj' | 'min' | 'aug' | [...]) (More in: JSHarmony.def.chords)
			*/

      // validate root and chord type
      if (this.isChordName(type) == false)
        throw new Error('Invalid Chord Type provided')
      if (this.isNote(root) == false)
        throw new Error('Invalid Note object provided')

      // make new chord
      var chord = new Chord()
      chord.type = type
      // add root to chord notes
      chord.notes[0] = root

      // iterate over each chord member and add each interval note
      for (var i = 1; i <= this.def.chords[type].length - 1; i++) {
        chord.notes[i] = this.makeIntervalNote(
          this.def.chords[type][i][0],
          this.def.chords[type][i][1],
          'asc',
          root
        )
      }

      // done!
      return chord
    },
  }
})()
