var i = 0;
var images = [];
var time = 2000;

images[0] = 'https://sgugit.ru/upload/resize_cache/iblock/ea1/1500_1000_18cf41fa480d4cf2f0047acf21eef73f0/l5xzdm9mtzh8651flkhidqiupf7k1l52.jpg';
images[1] = 'https://sgugit.ru/upload/resize_cache/iblock/6fa/1500_1000_18cf41fa480d4cf2f0047acf21eef73f0/0j2vax5lu6insixrn1yhw1p2cfsci2na.jpg';
images[2] = 'https://sgugit.ru/upload/resize_cache/iblock/3d5/1500_1000_18cf41fa480d4cf2f0047acf21eef73f0/gb9boe72gwvpv2rlr0kr8at7xxrl8m7m.jpg';
images[3] = 'https://sgugit.ru/upload/resize_cache/iblock/e42/5472_3648_18cf41fa480d4cf2f0047acf21eef73f0/ccvq73t4hk0ecc43jmaikb0y2592zsa9.jpg';
images[4] = 'https://sgugit.ru/upload/resize_cache/iblock/5dc/1500_1000_18cf41fa480d4cf2f0047acf21eef73f0/9jes1lfsqf4p2c12h8czfewm36jny9ts.jpg';

function changeSlide() {
    document.slider.src = images[i];
    if (i < images.length - 1) {
        i++;

    } else {
        i = 0;
    }
    setTimeout("changeSlide()", time);
}
window.onload = changeSlide;