import { Test } from '@nestjs/testing';

const createTestingModule = Test.createTestingModule.bind(Test);

jest
  .spyOn(Test, 'createTestingModule')
  .mockImplementation((metadata: any) =>
    createTestingModule(metadata).useMocker(() => ({})),
  );
