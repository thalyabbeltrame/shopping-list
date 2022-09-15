import { faker } from '@faker-js/faker';

function getNewItem() {
  return {
    title: faker.lorem.word(),
    url: faker.internet.url(),
    description: faker.lorem.sentence(),
    amount: 1000,
  };
}

export const itemsFactory = {
  getNewItem,
};
