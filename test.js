console.log('1');

setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => {
    console.log('3');
    setTimeout(() => console.log('4'), 0);
  });
  Promise.resolve().then(() => console.log('5'));
}, 0);

Promise.resolve().then(() => {
  console.log('6');
  setTimeout(() => {
    console.log('7');
    Promise.resolve().then(() => console.log('8'));
  }, 0);
  Promise.resolve().then(() => console.log('9'));
});

(async () => {
  console.log('10');
  await null;
  console.log('11');
  setTimeout(() => {
    console.log('12');
    Promise.resolve().then(() => console.log('13'));
  }, 0);
  await null;
  console.log('14');
})();

setTimeout(() => {
  console.log('15');
  Promise.resolve().then(() => {
    console.log('16');
    Promise.resolve().then(() => console.log('17'));
  });
}, 0);

console.log('18');

// 最后再补一个同步的 Promise
Promise.resolve().then(() => {
  console.log('19');
  Promise.resolve().then(() => console.log('20'));
});