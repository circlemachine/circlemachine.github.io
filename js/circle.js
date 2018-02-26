let circles = (() => {

    const BASE64 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";

    let c, ctx;
    let gears = [];
    let path = [];
    let color;

    function main() {
        c = document.getElementById("canvas");
        c.width = c.height = Math.min(innerWidth, innerHeight) - 100;
        ctx = c.getContext("2d");

        onresize = () => {
            c.width = c.height = Math.min(innerWidth, innerHeight) - 100;
            ctx = c.getContext("2d");
        };

        c.oncontextmenu = e => {
            e.preventDefault();
            e.stopPropagation();
        };

        let data = unescape(location.search).slice(1).split(";");
        let [minF, minR, minO, maxF, maxR, maxO] = data.slice(0, -1).map(x => parseFloat(x));

        color = data[6];

        let gearData = data[data.length - 1];
        for (let i = 0; i < gearData.length; i += 12) {
            let freq =   (BASE64.indexOf(gearData[i + 0]) << 18 | BASE64.indexOf(gearData[i + 1]) << 12 | BASE64.indexOf(gearData[i + 2 ]) << 6 | BASE64.indexOf(gearData[i + 3 ])) / 16777215 * (maxF - minF) + minF;
            let radius = (BASE64.indexOf(gearData[i + 4]) << 18 | BASE64.indexOf(gearData[i + 5]) << 12 | BASE64.indexOf(gearData[i + 6 ]) << 6 | BASE64.indexOf(gearData[i + 7 ])) / 16777215 * (maxR - minR) + minR;
            let offset = (BASE64.indexOf(gearData[i + 8]) << 18 | BASE64.indexOf(gearData[i + 9]) << 12 | BASE64.indexOf(gearData[i + 10]) << 6 | BASE64.indexOf(gearData[i + 11])) / 16777215 * (maxO - minO) + minO;
            gears.push({
                frequency: freq,
                radius: radius,
                offset: offset
            });
        }

        render(0);
    }

    function render(time) {
        ctx.lineCap = "butt";
        ctx.clearRect(0, 0, c.width, c.height);
        let x = 0;
        let y = 0;

        for (let gear of gears) {
            let dx = Math.cos(time / 1000 * gear.frequency * 2 * Math.PI + gear.offset) * gear.radius;
            let dy = Math.sin(time / 1000 * gear.frequency * 2 * Math.PI + gear.offset) * gear.radius;

            ctx.beginPath();
            ctx.arc((x + 0.5) * c.width, (y + 0.5) * c.height, gear.radius * c.width, 0, 2 * Math.PI);
            ctx.moveTo((x + 0.5) * c.width, (y + 0.5) * c.height);
            ctx.lineTo((x + dx + 0.5) * c.width, (y + dy + 0.5) * c.height);
            ctx.stroke();

            x += dx;
            y += dy;
        }

        path.push({
            x: x,
            y: y
        });

        ctx.save();
        ctx.lineWidth = 5;
        ctx.strokeStyle = color;
        ctx.beginPath();
        for (let point of path) {
            ctx.lineTo((point.x + 0.5) * c.width, (point.y + 0.5) * c.height);
        }
        ctx.stroke();
        ctx.restore();

        requestAnimationFrame(render);
    }

    main();

})();
