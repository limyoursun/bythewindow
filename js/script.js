const stampDate = document.getElementById("stampDate");
const date = new Date();
stampDate.innerText = `${date.getFullYear()}.${
  date.getMonth() + 1
}.${date.getDate()}`;
