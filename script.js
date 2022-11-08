window.onload = function () {
    "use strict";
    var paths = document.getElementsByTagName('path');
    var visualizer = document.getElementById('visualizer');
    var mask = visualizer.getElementById('mask');
    var h = document.getElementsByTagName('h1')[0];
    var path;
    var report = 0;
    var global_temp;

    function logArray(x) {
        // Manual function to convert original byte array to log scaled audio
        var temp_array = [  x.slice(0,1),       x.slice(1,2),       x.slice(2,3),       x.slice(3,4),
                            x.slice(4,5),       x.slice(5,7),       x.slice(7,9),       x.slice(9,13),
                            x.slice(13,17),     x.slice(17,23),     x.slice(23,30),     x.slice(30,40),
                            x.slice(40,54),     x.slice(54,72),     x.slice(72,95),     x.slice(95,127),
                            x.slice(127,169),   x.slice(169,225),   x.slice(225,299),   x.slice(299,499)]

        var new_array = []
        for (var i = 0; i<temp_array.length; i++) {
            var qs = temp_array[i].reduce((a,b) => {return a+b}, 0)
            var q = qs / temp_array[i].length
            new_array.push(q)
        }
        return new_array
    }

    var soundAllowed = function (stream) {
        window.persistAudioStream = stream;
        h.innerHTML = "Audio Stream Found";
        h.setAttribute('style', 'opacity: 0;');
        var audioContent = new AudioContext();
        var audioStream = audioContent.createMediaStreamSource( stream );
        var analyser = audioContent.createAnalyser();
        audioStream.connect(analyser);
        analyser.fftSize = 1024;
        var frequencyArray = new Uint8Array(analyser.frequencyBinCount);
        visualizer.setAttribute('viewBox', '0 0 20 255');

        for (var i = 0 ; i < 20; i++) {
                        path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        path.setAttribute('stroke-dasharray', '4, 1');
                        mask.appendChild(path);
        }
        var doDraw = function () {
            report = report + 1
            if (report == 20) {
                console.log(frequencyArray)
                global_temp = frequencyArray
            }
            requestAnimationFrame(doDraw);
            analyser.getByteFrequencyData(frequencyArray);
            var frequencyLogArray = logArray(frequencyArray)
            var adjustedLength;
            for (var i = 0 ; i < 20; i++) {
                adjustedLength = Math.floor(frequencyLogArray[i]) - (Math.floor(frequencyLogArray[i]) % 5);
                paths[i].setAttribute('d', 'M '+ (i+0.5) +',255 l 0,-' + adjustedLength);
            }
        }
        doDraw();
    }
    var notAllowed = function () {}
    navigator.getUserMedia({audio:true}, soundAllowed, notAllowed);
}