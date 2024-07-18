// stamp date
const stampDate = document.getElementById("stampDate");
const date = new Date();
stampDate.innerText = `${date.getFullYear()}.${
  date.getMonth() + 1
}.${date.getDate()}`;

// responsive
const conWrap = document.querySelector('.con_wrap');
const handleResize = () => {
  conWrap.style.display = window.innerWidth <= 1023 ? 'none' : 'flex';
};

window.onload = handleResize;
window.onresize = handleResize;