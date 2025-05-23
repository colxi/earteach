const getTrainersData = () => {
  return [
    {
      id: '1',
      name: 'Chords',
      constructor:
        'var tonic = JSHarmony.randomNote();\r\nvar type = TEST.items[index].value;\r\nvar chord = JSHarmony.randomChord(tonic, type);\r\nreturn chord;',
      rounds: '10',
      question: 'Which chord has just been played?',
      presets: [
        {
          id: '1',
          name: 'Majors and Minors (Triads, Arpeggiated)',
          items: [
            { name: 'major', value: 'major' },
            { name: 'minor', value: 'minor' },
          ],
          arpeggiated: '1',
          parent: '1',
          list_order: '1',
          owner: '0',
          completed: 0,
          score: 0,
        },
        {
          id: '2',
          name: 'Aug and Dims (Triads, Arpeggiated)',
          items: [
            { name: 'aug', value: 'aug' },
            { name: 'dim', value: 'dim' },
          ],
          arpeggiated: '1',
          parent: '1',
          list_order: '2',
          owner: '0',
          completed: 0,
          score: 0,
        },
        {
          id: '3',
          name: 'Majors, Minors, Aug and Dims (Triads, Arpeggiated)',
          items: [
            { name: 'major', value: 'major' },
            { name: 'minor', value: 'minor' },
            { name: 'aug', value: 'aug' },
            { name: 'dim', value: 'dim' },
          ],
          arpeggiated: '1',
          parent: '1',
          list_order: '3',
          owner: '0',
          completed: 0,
          score: 0,
        },
        {
          id: '4',
          name: 'Majors and Minors (Triads)',
          items: [
            { name: 'major', value: 'major' },
            { name: 'minor', value: 'minor' },
          ],
          arpeggiated: '0',
          parent: '1',
          list_order: '4',
          owner: '0',
          completed: 0,
          score: 0,
        },
        {
          id: '6',
          name: 'Aug and Dims (Triads)',
          items: [
            { name: 'aug', value: 'aug' },
            { name: 'dim', value: 'dim' },
          ],
          arpeggiated: '0',
          parent: '1',
          list_order: '5',
          owner: '0',
          completed: 0,
          score: 0,
        },
        {
          id: '5',
          name: 'Majors, Minors, Aug and Dims (Triads)',
          items: [
            { name: 'major', value: 'major' },
            { name: 'minor', value: 'minor' },
            { name: 'aug', value: 'aug' },
            { name: 'dim', value: 'dim' },
          ],
          arpeggiated: '0',
          parent: '1',
          list_order: '6',
          owner: '0',
          completed: 0,
          score: 0,
        },
        {
          id: '7',
          name: 'Max7 and minor7 (Arpeggiated)',
          items: [
            { name: 'max7', value: 'max7' },
            { name: 'm7', value: 'm7' },
          ],
          arpeggiated: '1',
          parent: '1',
          list_order: '7',
          owner: '0',
          completed: 0,
          score: 0,
        },
        {
          id: '8',
          name: '7 and semidim (Arpeggiated)',
          items: [
            { name: '7', value: '7' },
            { name: 'semidim', value: 'semidim' },
          ],
          arpeggiated: '1',
          parent: '1',
          list_order: '8',
          owner: '0',
          completed: 0,
          score: 0,
        },
        {
          id: '12',
          name: 'Max7, minor7, 7 and semidim (Arpeggiated)',
          items: [
            { name: 'max7', value: 'max7' },
            { name: 'm7', value: 'm7' },
            { name: '7', value: '7' },
            { name: 'semidim', value: 'semidim' },
          ],
          arpeggiated: '1',
          parent: '1',
          list_order: '9',
          owner: '0',
          completed: 0,
          score: 0,
        },
        {
          id: '9',
          name: 'Max7 and minor7',
          items: [
            { name: 'max7', value: 'max7' },
            { name: 'm7', value: 'm7' },
          ],
          arpeggiated: '0',
          parent: '1',
          list_order: '10',
          owner: '0',
          completed: 0,
          score: 0,
        },
        {
          id: '10',
          name: '7 and semidim',
          items: [
            { name: '7', value: '7' },
            { name: 'semidim', value: 'semidim' },
          ],
          arpeggiated: '0',
          parent: '1',
          list_order: '11',
          owner: '0',
          completed: 0,
          score: 0,
        },
        {
          id: '11',
          name: 'Max7, minor7, 7 and semidim',
          items: [
            { name: 'max7', value: 'max7' },
            { name: 'm7', value: 'm7' },
            { name: '7', value: '7' },
            { name: 'semidim', value: 'semidim' },
          ],
          arpeggiated: '0',
          parent: '1',
          list_order: '12',
          owner: '0',
          completed: 0,
          score: 0,
        },
      ],
      presetsCustom: [],
    },
    {
      id: '2',
      name: 'Intervals',
      constructor:
        'var root = JSHarmony.randomNote();\r\nvar item = TEST.items[index].value;\r\nvar interval = JSHarmony.makeInterval(item[0] , item[1], item[2], root);\r\nreturn interval;',
      rounds: '10',
      question: 'Which interval has just been played?',
      presets: [
        {
          id: '13',
          name: 'IIIM - VP - VIII (Melodic, Ascending)',
          items: [
            { name: '3M asc', value: ['3', 'M', 'asc'] },
            { name: '5P asc', value: ['5', 'P', 'asc'] },
            { name: '8P asc', value: ['8', 'P', 'asc'] },
          ],
          arpeggiated: '1',
          parent: '2',
          list_order: '1',
          owner: '0',
          completed: 0,
          score: 0,
        },
        {
          id: '14',
          name: 'IVP - VIM (Melodic, Ascending)',
          items: [
            { name: '4P asc', value: ['4', 'P', 'asc'] },
            { name: '6M asc', value: ['6', 'M', 'asc'] },
          ],
          arpeggiated: '1',
          parent: '2',
          list_order: '2',
          owner: '0',
          completed: 0,
          score: 0,
        },
        {
          id: '15',
          name: 'IIM - VIIM (Melodic, Ascending)',
          items: [
            { name: '2M asc', value: ['2', 'M', 'asc'] },
            { name: '7M asc', value: ['7', 'M', 'asc'] },
          ],
          arpeggiated: '1',
          parent: '2',
          list_order: '3',
          owner: '0',
          completed: 0,
          score: 0,
        },
        {
          id: '16',
          name: 'IIM - IIIM - IVP - VP - VIM - VIIM - VIIIP (Melodic, Ascending)',
          items: [
            { name: '2M asc', value: ['2', 'M', 'asc'] },
            { name: '3M asc', value: ['3', 'M', 'asc'] },
            { name: '4P asc', value: ['4', 'P', 'asc'] },
            { name: '5P asc', value: ['5', 'P', 'asc'] },
            { name: '6M asc', value: ['6', 'M', 'asc'] },
            { name: '7M asc', value: ['7', 'M', 'asc'] },
            { name: '8P asc', value: ['8', 'P', 'asc'] },
          ],
          arpeggiated: '1',
          parent: '2',
          list_order: '4',
          owner: '0',
          completed: 0,
          score: 0,
        },
        {
          id: '17',
          name: 'IIIM - VP - VIII (Melodic, Descending)',
          items: [
            { name: '3M desc', value: ['3', 'M', 'desc'] },
            { name: '5P desc', value: ['5', 'P', 'desc'] },
            { name: '8P desc', value: ['8', 'P', 'desc'] },
          ],
          arpeggiated: '1',
          parent: '2',
          list_order: '5',
          owner: '0',
          completed: 0,
          score: 0,
        },
        {
          id: '18',
          name: 'IVP - VIM (Melodic, Descending)',
          items: [
            { name: '4P desc', value: ['4', 'P', 'desc'] },
            { name: '6M desc', value: ['6', 'M', 'desc'] },
          ],
          arpeggiated: '1',
          parent: '2',
          list_order: '6',
          owner: '0',
          completed: 0,
          score: 0,
        },
        {
          id: '19',
          name: 'IIM - VIIM (Melodic, Descending)',
          items: [
            { name: '2M desc', value: ['2', 'M', 'desc'] },
            { name: '7M desc', value: ['7', 'M', 'desc'] },
          ],
          arpeggiated: '1',
          parent: '2',
          list_order: '7',
          owner: '0',
          completed: 0,
          score: 0,
        },
        {
          id: '20',
          name: 'IIM - IIIM - IVP - VP - VIM - VIIM - VIIIP (Melodic, Descending)',
          items: [
            { name: '2M desc', value: ['2', 'M', 'desc'] },
            { name: '3M desc', value: ['3', 'M', 'desc'] },
            { name: '4P desc', value: ['4', 'P', 'desc'] },
            { name: '5P desc', value: ['5', 'P', 'desc'] },
            { name: '6M desc', value: ['6', 'M', 'desc'] },
            { name: '7M desc', value: ['7', 'M', 'desc'] },
            { name: '8P desc', value: ['8', 'P', 'desc'] },
          ],
          arpeggiated: '1',
          parent: '2',
          list_order: '8',
          owner: '0',
          completed: 0,
          score: 0,
        },
      ],
      presetsCustom: [],
    },
    {
      id: '3',
      name: 'Scales',
      constructor:
        'var root = JSHarmony.randomNote();\r\nvar item = TEST.items[index].value;\r\nvar interval = JSHarmony.makeScale(item[0] , item[1], root);\r\nreturn interval;',
      rounds: '10',
      question: 'Which scale has just been played?',
      presets: [
        {
          id: '21',
          name: 'Major (ionian) and Minor',
          items: [
            { name: 'Major', value: ['major', 'ionian'] },
            { name: 'Minor', value: ['minor', 'aeolian'] },
          ],
          arpeggiated: '1',
          parent: '3',
          list_order: '1',
          owner: '0',
          completed: 0,
          score: 0,
        },
        {
          id: '22',
          name: 'Minor Natural (aeolian) and Minor Harmonic',
          items: [
            { name: 'Minor Natural', value: ['minor', 'aeolian'] },
            { name: 'Minor Harmonic', value: ['minor', 'harmonic'] },
          ],
          arpeggiated: '1',
          parent: '3',
          list_order: '2',
          owner: '0',
          completed: 0,
          score: 0,
        },
        {
          id: '23',
          name: 'Minor Natural (aeolian) and Minor Melodic',
          items: [
            { name: 'Minor Natural', value: ['minor', 'aeolian'] },
            { name: 'Minor Melodic', value: ['minor', 'melodic'] },
          ],
          arpeggiated: '1',
          parent: '3',
          list_order: '3',
          owner: '0',
          completed: 0,
          score: 0,
        },
        {
          id: '24',
          name: 'Minor Natural (aeolian), Minor Melodic, Minor Harmonic',
          items: [
            { name: 'Minor Natural', value: ['minor', 'aeolian'] },
            { name: 'Minor Melodic', value: ['minor', 'melodic'] },
            { name: 'Minor Harmonic', value: ['minor', 'harmonic'] },
          ],
          arpeggiated: '1',
          parent: '3',
          list_order: '4',
          owner: '0',
          completed: 0,
          score: 0,
        },
        {
          id: '25',
          name: 'Major (ionian), Minor Natural (aeolian), Minor Melodic, Minor Harmonic',
          items: [
            { name: 'Major', value: ['major', 'ionian'] },
            { name: 'Minor Natural', value: ['minor', 'aeolian'] },
            { name: 'Minor Melodic', value: ['minor', 'melodic'] },
            { name: 'Minor Harmonic', value: ['minor', 'harmonic'] },
          ],
          arpeggiated: '1',
          parent: '3',
          list_order: '5',
          owner: '0',
          completed: 0,
          score: 0,
        },
      ],
      presetsCustom: [],
    },
  ]
}
