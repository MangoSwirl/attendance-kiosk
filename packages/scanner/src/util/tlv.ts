// Types for TLV structure
export type TLVField = {
  tag: number[];
  length: number;
  value: number[];
  rawLength: number[];
};

/**
 * Parses BER-TLV encoded data from an array of numbers
 * @param data Array of numbers representing BER-TLV encoded data
 * @returns Array of parsed TLV fields
 */
export function parseTLV(data: number[]): TLVField[] {
  const result: TLVField[] = [];
  let position = 0;

  while (position < data.length) {
    // Parse tag
    const tag: number[] = [];
    tag.push(data[position]);

    // Check if tag is multi-byte (bit 5 of first byte is set)
    if ((data[position] & 0x1f) === 0x1f) {
      position++;
      // Continue reading tag bytes until a byte without bit 7 set is found
      while (position < data.length && (data[position] & 0x80) === 0x80) {
        tag.push(data[position]);
        position++;
      }
      tag.push(data[position]);
    }
    position++;

    // Parse length
    let length = 0;
    const rawLength: number[] = [];
    rawLength.push(data[position]);

    if ((data[position] & 0x80) === 0x80) {
      // Long form length
      const lengthBytes = data[position] & 0x7f;
      position++;

      for (let i = 0; i < lengthBytes; i++) {
        rawLength.push(data[position]);
        length = (length << 8) | data[position];
        position++;
      }
    } else {
      // Short form length
      length = data[position];
      position++;
    }

    // Parse value
    const value = data.slice(position, position + length);
    position += length;

    result.push({
      tag,
      length,
      value,
      rawLength,
    });
  }

  return result;
}

/**
 * Helper function to format a TLV field as a string for debugging
 * @param tlv Parsed TLV field
 * @returns Formatted string representation
 */
function formatTLV(tlv: TLVField): string {
  return (
    `Tag: ${tlv.tag.map((b) => b.toString(16).padStart(2, "0")).join("")}, ` +
    `Length: ${tlv.length}, ` +
    `Value: ${tlv.value.map((b) => b.toString(16).padStart(2, "0")).join("")}`
  );
}

// Example usage:
const sampleData = [
  0x6f, // Tag (File Control Information)
  0x1a, // Length (26 bytes)
  0x84, // Tag (DF Name)
  0x0e, // Length (14 bytes)
  0x31,
  0x50,
  0x41,
  0x59,
  0x2e,
  0x53,
  0x59,
  0x53,
  0x2e,
  0x44,
  0x44,
  0x46,
  0x30,
  0x31, // Value
  0xa5, // Tag (File Control Parameters)
  0x08, // Length (8 bytes)
  0x88, // Tag (Short File Identifier)
  0x01, // Length (1 byte)
  0x02, // Value
  0x5f,
  0x2d, // Tag (Language Preference)
  0x02, // Length (2 bytes)
  0x65,
  0x6e, // Value
];

const parsed = parseTLV(sampleData);
