const img = document.querySelector('img');
const mainDiv = document.querySelector(".mainDiv");
img.addEventListener('click', function (e) {
    let input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('name', 'options[]');
    input.setAttribute('class', 'inputs');
    let br = document.createElement('br');
    img.insertAdjacentElement("beforebegin", input);
    img.insertAdjacentElement("beforebegin", br);
});