const mockAdd = jest.fn().mockResolvedValue({ id: 'mock-doc-id' });
const mockCollection = jest.fn().mockReturnValue({ add: mockAdd });

const firestore = () => ({
  collection: mockCollection,
});

export default firestore;
