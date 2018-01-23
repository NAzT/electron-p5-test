// Declare a "SerialPort" object
var serial
var portListDiv
var portSelect
var selectedPort
var serialConsoleEnabled = false
var serialConsole
var consoleBuffer = []
var lastConsoleLogTime = Date.now()
var LOGWAIT = 500
var nat

function setup () {
  createCanvas(1, 1)

  portListDiv = select('#serialports')
  nat = select('#nat')

  // GUI controls
  portSelect = createSelect()
  portSelect.option('No Ports Found')
  portSelect.parent(select('#portselectdiv'))

  // Instantiate our SerialPort object
  serial = new p5.SerialPort()

  // Callback for list of ports available
  serial.on('list', gotList)

  // Get a list the ports available
  // You should have a callback defined to see the results
  serial.list()

  // Here are the callbacks that you can register

  // When we connect to the underlying server
  serial.on('connected', serverConnected)

  // When we get a list of serial ports that are available
  // OR
  //serial.onList(gotList);

  // When we some data from the serial port
  serial.on('data', gotData)
  // OR
  //serial.onData(gotData);

  // When or if we get an error
  serial.on('error', gotError)
  // OR
  //serial.onError(gotError);

  // When our serial port is opened and ready for read/write
  serial.on('open', gotOpen)
  // OR
  //serial.onOpen(gotOpen);

  // Callback to get the raw data, as it comes in for handling yourself
  serial.on('rawdata', gotRawData)
  // OR
  //serial.onRawData(gotRawData);
}

// We are connected and ready to go
function serverConnected () {
  seriallog('Connected to Server')
}

// Got the list of ports
function gotList (thelist) {
  seriallog('Available Serial Ports:')

  if (portSelect) {
    portSelect.remove()
  }

  portSelect = createSelect()
  portSelect.parent(select('#portselectdiv'))

  //This isn't working - Looks like p5.dom bug
  //newPortSelect.changed(portSelected);
  portSelect.elt.addEventListener('change', portSelected)

  if (portListDiv) {
    portListDiv.elt.innerHTML = ''
  }

  for (var i = 0; i < thelist.length; i++) {
    seriallog(i + ' ' + thelist[i])
    portSelect.option(thelist[i])
    if (portListDiv) {
      portListDiv.elt.innerHTML += '<br />\n' + thelist[i]
    }
  }
}

function portSelected () {
  console.log('port selected.')
  selectedPort = portSelect.value()
  serial.open(selectedPort)
  portSelect.hide()
}

function gotOpen () {
  seriallog('Serial Port is Open')
}

// Ut oh, here is an error, let's log it
function gotError (theerror) {
  seriallog(theerror)
}

// There is data available to work with from the serial port
function gotData () {
  var currentString = serial.readLine()  // read the incoming string
  trim(currentString)                    // remove any trailing whitespace
  if (!currentString) return             // if the string is empty, do no more
  // log(currentString)             // log the string
  // console.log('on_data = ', currentString)
  (nat.elt.innerHTML = currentString)
  latestData = currentString            // save it for the draw method
}

// We got raw from the serial port
function gotRawData (thedata) {
  seriallog(thedata)
}

// Methods available
// serial.read() returns a single byte of data (first in the buffer)
// serial.readChar() returns a single char 'A', 'a'
// serial.readBytes() returns all of the data available as an array of bytes
// serial.readBytesUntil('\n') returns all of the data available until a '\n' (line break) is encountered
// serial.readString() retunrs all of the data available as a string
// serial.readStringUntil('\n') returns all of the data available as a string until a specific string is encountered
// serial.readLine() calls readStringUntil with "\r\n" typical linebreak carriage return combination
// serial.last() returns the last byte of data from the buffer
// serial.lastChar() returns the last byte of data from the buffer as a char
// serial.clear() clears the underlying serial buffer
// serial.available() returns the number of bytes available in the buffer
// serial.write(somevar) writes out the value of somevar to the serial device

function draw () {
}

function seriallog (txt) {
  //console.log(txt + "\n");
  if (serialConsoleEnabled) {

    // if (serialConsole.elt.value.length >= 800)
    // {
    // 	serialConsole.elt.value = serialConsole.elt.value.substring(400);
    // }
    // serialConsole.elt.value += txt + "\n";
    // serialConsole.elt.scrollTop = serialConsole.elt.scrollHeight;

    consoleBuffer.push(txt)
    console.log(consoleBuffer)
    if (lastConsoleLogTime + LOGWAIT < Date.now()) {
      if (serialConsole.elt.value.length >= 800) {
        serialConsole.elt.value = serialConsole.elt.value.substring(400)
      }
      serialConsole.elt.value += consoleBuffer.map((val, idx) => String.fromCharCode(val)).join('')
      serialConsole.elt.scrollTop = serialConsole.elt.scrollHeight

      lastConsoleLogTime = Date.now()
      consoleBuffer.length = 0
      console.log('wrote to text area ' + consoleBuffer.length)
    }
  }
}
