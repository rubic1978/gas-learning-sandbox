// Простейший тест, проверяющий, что функции объявлены
function runTests() {
  if (typeof sayHello !== 'function') throw new Error('sayHello not defined');
  if (typeof logInfo !== 'function') throw new Error('logInfo not defined');
  console.log('All basic tests passed.');
}

runTests();