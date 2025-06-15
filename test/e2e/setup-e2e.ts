jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-message-id',
    }),
  }),
}));

jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({
    data: {
      current: {
        temp_c: 21,
        humidity: 65,
        condition: {
          text: 'Sunny',
        },
      },
    },
  }),
}));

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    })),
  };
});

jest.mock('bull', () => {
  const mockQueue = {
    add: jest.fn().mockResolvedValue({}),
    process: jest.fn(),
    on: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
  };
  return jest.fn().mockImplementation(() => mockQueue);
});
