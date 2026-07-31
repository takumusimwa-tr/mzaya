const {
  createUploadSessionSchema,
  finalizeAttachmentSchema,
} = require('../src/validators/attachment.validator');
const {
  validateUploadDeclaration,
  normalizeFilename,
} = require('../src/services/mediaValidation.service');
const {
  normalizeWaveform,
} = require('../src/services/voiceProcessing.service');

describe('rich messaging validation', () => {
  test('accepts supported image uploads', () => {
    const result = createUploadSessionSchema.validate({
      conversationId: '9df47db9-0103-4e79-9204-767981bf266f',
      filename: 'receipt.jpg',
      mimeType: 'image/jpeg',
      byteSize: 500000,
    });

    expect(result.error).toBeUndefined();
  });

  test('rejects unsupported executable files', () => {
    expect(() => validateUploadDeclaration({
      filename: 'payload.exe',
      mimeType: 'application/x-msdownload',
      byteSize: 1000,
    })).toThrow('Unsupported file type');
  });

  test('normalizes unsafe filenames', () => {
    expect(normalizeFilename('../../Receipt July?.pdf'))
      .toBe('Receipt-July.pdf');
  });

  test('accepts voice-note metadata', () => {
    const result = finalizeAttachmentSchema.validate({
      clientMessageId: 'voice-1',
      durationMs: 4200,
      waveform: [0.1, 0.4, 0.8],
    });

    expect(result.error).toBeUndefined();
  });

  test('compresses waveform data', () => {
    expect(normalizeWaveform([0, 0.2, 0.5, 1], 2)).toHaveLength(2);
  });
});
