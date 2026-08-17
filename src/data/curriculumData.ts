export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Quiz {
  question: string;
  options: Option[];
  explanation: string;
}

export interface Lesson {
  id: string;
  module: string;
  unitId: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  defaultCode: string;
  expectedOutput: string;
  icon: 'led' | 'buzzer' | 'lcd' | 'dht' | 'ultrasonic' | 'servo' | 'rfid' | 'camera' | 'trophy';
  pin: number;
  quiz?: Quiz;
}

export interface Unit {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  lessons: Lesson[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface HardwareComponent {
  id: string;
  name: string;
  type: 'Actuator' | 'Input Device' | 'Mechanical' | 'Temp/Humidity' | 'Sensor';
  icon: 'led' | 'bell' | 'settings' | 'thermometer' | 'eye' | 'cpu';
  status: 'active' | 'locked';
}

export const unitsData: Unit[] = [
  {
    id: 'unit1',
    title: 'Unit 1: Basic LED Controls',
    subtitle: 'Mastering the fundamentals of GPIO control with Python.',
    progress: 100,
    lessons: [
      {
        id: 'led-basic',
        module: 'MODULO HARDWARE',
        unitId: 'unit1',
        title: 'Accendere un LED',
        subtitle: 'Lezione 01',
        description: 'In questa lezione impareremo come controllare il flusso di elettroni attraverso un pin GPIO per alimentare un diodo a emissione di luce (LED). La precisione è fondamentale: un errore di cablaggio potrebbe "bruciare" il componente.',
        difficulty: 'BASIC',
        defaultCode: `import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(18, GPIO.OUT)

# Accendi il LED
print("LED acceso!")
GPIO.output(18, GPIO.HIGH)
time.sleep(2)

# Spegni il LED
print("LED spento!")
GPIO.output(18, GPIO.LOW)
`,
        expectedOutput: 'LED acceso!\nLED spento!',
        icon: 'led',
        pin: 18,
        quiz: {
          question: 'Quale comando Python accende il pin GPIO 18?',
          options: [
            { id: 'A', text: 'GPIO.output(18, GPIO.HIGH)', isCorrect: true },
            { id: 'B', text: 'GPIO.input(18, True)', isCorrect: false },
            { id: 'C', text: 'pin.state(18, "ON")', isCorrect: false },
            { id: 'D', text: 'GPIO.write(18, 1)', isCorrect: false }
          ],
          explanation: 'Ottimo lavoro! Il comando output() viene utilizzato per inviare segnali di tensione ai pin, mentre GPIO.HIGH imposta il valore a 3.3V (ON).'
        }
      }
    ]
  },
  {
    id: 'unit2',
    title: 'Unit 2: Electronic Components',
    subtitle: 'Mastering the fundamentals of GPIO control with Python.',
    progress: 35,
    lessons: [
      {
        id: 'led-adv',
        module: 'MODULO HARDWARE',
        unitId: 'unit2',
        title: 'Lampeggio del LED',
        subtitle: 'Lezione 02',
        description: 'Crea un ciclo per far lampeggiare un LED connesso al pin 18. Imparerai l\'uso di cicli while e della temporizzazione con il modulo "time".',
        difficulty: 'BASIC',
        defaultCode: `import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(18, GPIO.OUT)

print("Inizio lampeggio (5 cicli)...")
for i in range(5):
    GPIO.output(18, GPIO.HIGH)
    time.sleep(0.5)
    GPIO.output(18, GPIO.LOW)
    time.sleep(0.5)
print("Lampeggio completato!")
`,
        expectedOutput: 'Inizio lampeggio (5 cicli)...\nLampeggio completato!',
        icon: 'led',
        pin: 18
      },
      {
        id: 'input-button',
        module: 'MODULO HARDWARE',
        unitId: 'unit2',
        title: 'Gestione di un Pulsante',
        subtitle: 'Lezione 03',
        description: 'Impara a configurare un pin GPIO in modalità INPUT per leggere lo stato logico di un pulsante fisico (HIGH o LOW).',
        difficulty: 'INTERMEDIATE',
        defaultCode: `import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(25, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

print("In attesa di pressione pulsante sul GPIO 25...")
# Simuliamo la lettura
stato = GPIO.input(25)
print(f"Stato pulsante rilevato: {stato}")
`,
        expectedOutput: 'In attesa di pressione pulsante sul GPIO 25...\nStato pulsante rilevato: 1',
        icon: 'led',
        pin: 25,
        quiz: {
          question: 'Come si configura una resistenza di pull-down integrata nel Raspberry Pi?',
          options: [
            { id: 'A', text: 'pull_up_down=GPIO.PUD_DOWN', isCorrect: true },
            { id: 'B', text: 'resistor=GPIO.PULL_DOWN', isCorrect: false },
            { id: 'C', text: 'mode=GPIO.INPUT_PULLDOWN', isCorrect: false },
            { id: 'D', text: 'pull=down', isCorrect: false }
          ],
          explanation: 'Corretto! La libreria RPi.GPIO permette di impostare la resistenza interna di pull-down usando il parametro pull_up_down impostato su GPIO.PUD_DOWN.'
        }
      },
      {
        id: 'buzzer-active',
        module: 'MODULO HARDWARE',
        unitId: 'unit2',
        title: 'Controllo del Buzzer Attivo',
        subtitle: 'Lezione 04',
        description: 'In questa sessione avanzata esploreremo l\'interfacciamento con trasduttori piezoelettrici attivi. A differenza dei passivi, i buzzer attivi contengono un oscillatore interno e necessitano solo di tensione continua per emettere suono.',
        difficulty: 'ADVANCED',
        defaultCode: `import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(17, GPIO.OUT)

# Loop di test
print("Attivazione buzzer...")
GPIO.output(17, GPIO.HIGH)
time.sleep(1)
GPIO.output(17, GPIO.LOW)
print("Buzzer disattivato.")
`,
        expectedOutput: 'Attivazione buzzer...\nBuzzer disattivato.',
        icon: 'buzzer',
        pin: 17,
        quiz: {
          question: 'Qual è la differenza principale tra un buzzer attivo ed uno passivo?',
          options: [
            { id: 'A', text: 'L\'attivo richiede solo alimentazione DC per suonare poiché integra un oscillatore interno', isCorrect: true },
            { id: 'B', text: 'Il passivo consuma molta più corrente dell\'attivo', isCorrect: false },
            { id: 'C', text: 'Il passivo necessita di un chip integrato aggiuntivo', isCorrect: false },
            { id: 'D', text: 'L\'attivo funziona solo con segnali PWM ad alta frequenza', isCorrect: false }
          ],
          explanation: 'Risposta esatta! Un buzzer attivo suona non appena riceve una tensione costante (grazie all\'oscillatore interno), mentre quello passivo ha bisogno di un segnale alternato o PWM per vibrare.'
        }
      },
      {
        id: 'lcd1602',
        module: 'MODULO HARDWARE',
        unitId: 'unit2',
        title: 'Schermo LCD1602',
        subtitle: 'Lezione 05',
        description: 'Collega e programma un display LCD 16x2 per visualizzare stringhe di testo dinamiche inviate tramite bus I2C.',
        difficulty: 'INTERMEDIATE',
        defaultCode: `import smbus
import time

# Indirizzo I2C dello schermo
I2C_ADDR = 0x27
print(f"Inizializzazione LCD all'indirizzo {hex(I2C_ADDR)}...")
print("Scrittura: 'Ciao PyCircuit!'")
`,
        expectedOutput: "Inizializzazione LCD all'indirizzo 0x27...\nScrittura: 'Ciao PyCircuit!'",
        icon: 'lcd',
        pin: 27
      },
      {
        id: 'dht11',
        module: 'MODULO HARDWARE',
        unitId: 'unit2',
        title: 'Sensore di Temperatura DHT11',
        subtitle: 'Lezione 06',
        description: 'Impara ad acquisire letture di temperatura e umidità relativa dell\'ambiente usando il sensore a singolo filo DHT11.',
        difficulty: 'INTERMEDIATE',
        defaultCode: `import Adafruit_DHT

sensor = Adafruit_DHT.DHT11
pin = 4

print("Lettura sensore DHT11...")
humidity, temperature = Adafruit_DHT.read_retry(sensor, pin)
print(f"Temp: {temperature}°C  Umidità: {humidity}%")
`,
        expectedOutput: 'Lettura sensore DHT11...\nTemp: 24.5°C  Umidità: 48%',
        icon: 'dht',
        pin: 4
      },
      {
        id: 'ultrasounds',
        module: 'MODULO HARDWARE',
        unitId: 'unit2',
        title: 'Sensore ad Ultrasuoni HC-SR04',
        subtitle: 'Lezione 07',
        description: 'Calcola la distanza di un ostacolo misurando il tempo di volo di impulsi ad ultrasuoni inviati e ricevuti.',
        difficulty: 'ADVANCED',
        defaultCode: `import RPi.GPIO as GPIO
import time

TRIG = 23
ECHO = 24
print("Calcolo distanza ad ultrasuoni...")
# Invio impulso trigger
`,
        expectedOutput: 'Calcolo distanza ad ultrasuoni...\nDistanza ostacolo: 42.1 cm',
        icon: 'ultrasonic',
        pin: 23
      }
    ]
  }
];

export const achievementsData: Achievement[] = [
  {
    id: 'ach-1',
    title: 'Circuit Pro',
    description: 'Completa tutti i circuiti di livello Avanzato',
    icon: 'lock',
    unlocked: false
  },
  {
    id: 'ach-2',
    title: 'Loop Master',
    description: 'Scrivi un ciclo infinito senza mandare in crash la CPU',
    icon: 'sparkle',
    unlocked: true
  },
  {
    id: 'ach-3',
    title: 'Hardware Hero',
    description: 'Collega con successo un componente fisico reale',
    icon: 'award',
    unlocked: false
  }
];

export const componentsData: HardwareComponent[] = [
  { id: 'comp-1', name: 'LED Module', type: 'Actuator', icon: 'led', status: 'active' },
  { id: 'comp-2', name: 'PIR Sensor', type: 'Input Device', icon: 'eye', status: 'active' },
  { id: 'comp-3', name: 'Servo Motor', type: 'Mechanical', icon: 'settings', status: 'active' },
  { id: 'comp-4', name: 'DHT11 Sensor', type: 'Temp/Humidity', icon: 'thermometer', status: 'active' }
];

export const shopItems = [
  { id: 'sh-1', name: 'SunFounder Raphael Kit', price: '34.90€', desc: 'Sensori, LED, Buzzer e LCD compatibili con le lezioni', count: '45 disponibili', icon: 'box' },
  { id: 'sh-2', name: 'Raspberry Pi 5 (8GB)', price: '89.00€', desc: 'La scheda di sviluppo ufficiale per programmare in Python', count: 'Disponibilità limitata', icon: 'cpu' },
  { id: 'sh-3', name: 'Cavi Jumper M-F (40 pz)', price: '4.50€', desc: 'Cavi di collegamento flessibili per breadboard', count: 'Sempre disponibile', icon: 'cable' }
];
