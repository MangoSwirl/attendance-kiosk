import HID from "node-hid";
import { crc16ccitt } from "crc";
import statusCodes from "./statuscodes.js";
import arraysAreEqual from "./util/arraysAreEqual.js";
import { parseTLV } from "./util/tlv.js";

let reader: HID.HID;

export function connect(onScanHandler: (payload: string) => void) {
  const devices = HID.devices();

  const pipInfo = devices.find(
    (d) => d.vendorId === 0x0acd && d.productId === 17984 && d.interface === 0
  );

  if (!pipInfo) {
    console.log("PiP not found.");
    return;
  }

  const reader = new HID.HID(pipInfo.path!);

  let incomingReports: number[][] = [];

  reader.on("data", (report: Buffer) => {
    incomingReports.push(report.toJSON().data);

    if ([1, 4].includes(incomingReports[incomingReports.length - 1][0])) {
      onFrame(reader, idtechHIDDecode(incomingReports), onScanHandler);
      incomingReports = [];
    }
  });

  reader.on("error", (error) => {
    console.log("New error:");
    console.log(error);
  });

  sendCommand(reader, 0x01, 0x12, [0x03]); // Auto-poll cards and send them through HID
  sendCommand(reader, 0x01, 0x05, [0x10, 0x05]); // Disable buzzer

  console.log("Connected to reader");

  return reader;
}

function onFrame(
  reader: HID.HID,
  frame: number[],
  onScanHandler: (payload: string) => void
) {
  if (!crcVerify(frame)) {
    // Apple Wallet for some reason doesn't follow the normal frame format so the checksum is wrong
    if (arraysAreEqual(frame.slice(0, 2), [0xdf, 0xed])) {
      const tlv = parseTLV(frame.slice(9));

      const payload = tlv
        .find((t) => arraysAreEqual(t.tag, [0x9f, 0x27]))
        ?.value.map((b) => String.fromCharCode(b))
        .join("");

      if (!payload) {
        console.log("No payload found");
        return;
      }

      onScanHandler(payload);
    }

    // Here it's not Apple Wallet, it's just corrupted or something so we'll ignore it
    return;
  }

  const responseFrame = new ResponseFrame(frame);

  // Normal card scan
  if (
    responseFrame.commandByte === 0x02 &&
    responseFrame.statusCodeByte === 0x00
  ) {
    // I haven't fully figured out what's up with the first 7 bytes but the rest is TLV
    const tlv = parseTLV(responseFrame.data.slice(7));

    // I haven't fully deciphered what most of the stuff in the TLV is but I know this is consistently the UID sooo
    const uid = tlv
      .find((t) => arraysAreEqual(t.tag, [0xdf, 0xed, 0x44]))
      ?.value.map((b) => b.toString(16).padStart(2, "0").toUpperCase())
      .join(":");

    if (!uid) {
      console.log("No UID found");
      return;
    }

    onScanHandler(uid);
  }
}

function msb(hex: number) {
  return Math.floor(hex / 256);
}

function lsb(hex: number) {
  return hex - msb(hex) * 256;
}

function combineMSBandLSB(msb: number, lsb: number) {
  return lsb + msb * 256;
}

function idtechHIDEncode(byteArray: number[]) {
  let reports = [];

  for (let i = 0; i < Math.ceil(byteArray.length / 63); i++) {
    reports.push(byteArray.slice(i * 63, (i + 1) * 63));
  }

  while (reports[reports.length - 1].length < 63) {
    reports[reports.length - 1].push(0x00);
  }

  reports.forEach((report) => report.unshift(0x03));

  reports[reports.length - 1][0] = 0x04;

  reports[0][0] = reports.length > 1 ? 0x02 : 0x01;

  return reports;
}

function idtechHIDDecode(reportArray: number[][]) {
  // console.log(reportArray);

  reportArray.forEach((report) => report.shift());
  const frame = reportArray.flat();
  return frame.slice(0, combineMSBandLSB(frame[12], frame[13]) + 16);
}

function crcVerify(frame: number[]) {
  const expectedCRC = combineMSBandLSB(
    frame[frame.length - 2],
    frame[frame.length - 1]
  );
  const actualCRC = crc16ccitt(
    Buffer.from(frame.slice(0, frame.length - 2)),
    0xffff
  );

  return expectedCRC === actualCRC;
}

export function sendCommand(
  reader: HID.HID,
  command: number,
  subcommand: number,
  data: number[]
) {
  let payload = [
    0x56, // V
    0x69, // i
    0x56, // V
    0x4f, // O
    0x74, // t
    0x65, // e
    0x63, // c
    0x68, // h
    0x32, // 2
    0x00, // 0
    command, // Command
    subcommand, // Sub-command
    msb(data.length), // Data length (MSB)
    lsb(data.length), // Data length (LSB)
    ...data, // Data
  ];

  const crc = crc16ccitt(Buffer.from(payload), 0xffff);

  payload.push(msb(crc));
  payload.push(lsb(crc));

  const reports = idtechHIDEncode(payload);

  for (let i = 0; i < reports.length; i++) {
    const report = reports[i];

    reader.write(report);
  }
}

export function convertHexToByteArray(hexString: string) {
  const byteArray = [];

  for (let i = 0; i < hexString.length; i += 2) {
    const hexDigit1 = hexString[i];
    const hexDigit2 = hexString[i + 1];

    const byte = parseInt(hexDigit1 + hexDigit2, 16);
    byteArray.push(byte);
  }

  return byteArray;
}

class ResponseFrame {
  rawBytes: number[];

  constructor(rawBytes: number[]) {
    this.rawBytes = rawBytes;
  }

  get commandByte() {
    return this.rawBytes[10];
  }

  get statusCodeByte() {
    return this.rawBytes[11];
  }

  get statusCodeMessage() {
    return statusCodes[this.statusCodeByte];
  }

  get dataLength() {
    return combineMSBandLSB(this.rawBytes[12], this.rawBytes[13]);
  }

  get data() {
    return this.rawBytes.slice(14, this.dataLength + 14);
  }
}
