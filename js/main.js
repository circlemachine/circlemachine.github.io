let circles = (() => {

    const BASE64 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";
    const MIN_EDIT_DIST = 20;
    const EPSILON = 0.0001;

    let c, ctx;

    let mouse;

    let undoQueue = [];
    let redoQueue = [];

    let points = [];
    let click = false;
    let mousedown = false;

    let holding = null;

    let precision, helper, line, picker;

    function main() {
        c = document.getElementById("canvas");
        c.width = c.height = Math.min(innerWidth, innerHeight) - 100;
        ctx = c.getContext("2d");

        onresize = () => {
            c.width = c.height = Math.min(innerWidth, innerHeight) - 100;
            ctx = c.getContext("2d");
        };

        precision = document.getElementById("precision");
        helper = document.getElementById("helper");
        line = document.getElementById("line");
        picker = document.getElementById("picker");

        let undo = () => {
            if (undoQueue.length > 0) {
                let action = undoQueue.pop();
                switch (action.action) {
                    case "addPoint":
                        points.pop();
                        break;
                    case "movePoint":
                        points[action.id].x = action.from.x;
                        points[action.id].y = action.from.y;
                        break;
                }
                redoQueue.push(action);
            }
        };

        let redo = () => {
            if (redoQueue.length > 0) {
                let action = redoQueue.pop();
                switch (action.action) {
                    case "addPoint":
                        points.push(action.point);
                        break;
                    case "movePoint":
                        points[action.id].x = action.to.x;
                        points[action.id].y = action.to.y;
                        break;
                }
            }
        };

        let clear = () => {
            if (confirm("Are you sure you want to delete everything?")) {
                points = [];
                redoPoints = [];
            }
        };

        document.addEventListener("keydown", e => {
            switch (e.key) {
                case "z":
                    undo();
                    break;
                case "y":
                    redo();
                    break;
                case "x":
                    clear();
                    break;
            }
        });

        document.getElementById("undo").onclick = undo;
        document.getElementById("redo").onclick = redo;
        document.getElementById("clear").onclick = clear;

        mouse = new Vec(0, 0);
        c.addEventListener("mousemove", e => {
            let rect = c.getBoundingClientRect();
            mouse.x = (e.clientX - rect.x) / c.width;
            mouse.y = (e.clientY - rect.y) / c.height;
        });

        c.oncontextmenu = e => {
            e.preventDefault();
            e.stopPropagation();
        };

        c.addEventListener("mousedown", e => {
            switch (e.button) {
                case 0:
                    mousedown = true;
                    click = true;
                    break;
                case 2:
                    let closestDist = Infinity;
                    let closest = null;
                    for (let point of points) {
                        let dist = point.sub(mouse).mag();
                        if (dist < closestDist) {
                            closestDist = dist;
                            closest = point;
                        }
                    }

                    if (closestDist < MIN_EDIT_DIST / c.width) {
                        holding = closest;
                    }

                    break;
            }
        });

        document.addEventListener("mouseup", e => {
            mousedown = false;
            holding = null;
        });

        document.getElementById("convert").onclick = () => {

            if (points.length == 0) {
                alert("You need to draw something first!")
                return;
            }

            let values = [];
            for (let point of points) {
                values.push(new Fourier.Complex(point.x - 0.5, point.y - 0.5));
            }

            let transformed = Fourier.DFT(values);

            let length = transformed.length;
            let gears = [{
                frequency: 0,
                radius: Math.hypot(transformed[0].real, transformed[0].imag) / length,
                offset: Math.atan2(transformed[0].imag, transformed[0].real)
            }];
            for (let i = 1; i < length / 2; i++) {
                gears.push({
                    frequency: i,
                    radius: Math.hypot(transformed[i].real, transformed[i].imag) / length,
                    offset: Math.atan2(transformed[i].imag, transformed[i].real)
                });
                gears.push({
                    frequency: -i,
                    radius: Math.hypot(transformed[length - i].real, transformed[length - i].imag) / length,
                    offset: Math.atan2(transformed[length - i].imag, transformed[length - i].real)
                });
            }
            gears.pop();
            gears = gears.filter(gear => gear.radius > EPSILON);
            gears.sort((a, b) => b.radius - a.radius);


            let minF = minR = minO = Infinity;
            let maxF = maxR = maxO = -Infinity;
            for (let gear of gears) {
                minF = Math.min(gear.frequency, minF);
                minR = Math.min(gear.radius, minR);
                minO = Math.min(gear.offset, minO);
                maxF = Math.max(gear.frequency, maxF);
                maxR = Math.max(gear.radius, maxR);
                maxO = Math.max(gear.offset, maxO);
            }

            let normalized = gears.map(gear => {
                return {
                    frequency: (gear.frequency - minF) / (maxF - minF),
                    radius: (gear.radius - minR) / (maxR - minR),
                    offset: (gear.offset - minO) / (maxO - minO)
                };
            });

            let f = norm.frequency * 16777215;
            let r = norm.radius * 16777215;
            let o = norm.offset * 16777215;

            let gearData = `${minF.toFixed(0)};${minR.toFixed(3)};${minO.toFixed(3)};${maxF.toFixed(0)};${maxR.toFixed(3)};${maxO.toFixed(3)};${picker.dataset.value};` + normalized.map(norm => {
                return BASE64[f >> 18] + BASE64[f >> 12 & 63] + BASE64[f >> 6 & 63] + BASE64[f & 63] +
                       BASE64[r >> 18] + BASE64[r >> 12 & 63] + BASE64[r >> 6 & 63] + BASE64[r & 63] +
                       BASE64[o >> 18] + BASE64[o >> 12 & 63] + BASE64[o >> 6 & 63] + BASE64[o & 63]
            }).join``;

            open("circle.html?" + gearData);
        }

        loop();
    }

    function loop() {
        update();
        render();
        requestAnimationFrame(loop);
    }

    function update() {
        let p = new Vec(mouse);
        p.id = points.length;
        if (click) {
            points.push(p);
            undoQueue.push({ action: "addPoint", point: new Vec(p) });
            redoQueue = [];
        } else if (mousedown) {
            if (points[points.length - 1].sub(mouse).mag() > precision.value / c.width) {
                points.push(p);
                undoQueue.push({ action: "addPoint", point: new Vec(p) });
                redoQueue = [];
            }
        }

        if (holding != null) {
            undoQueue.push({ action: "movePoint", id: holding.id, from: new Vec(holding), to: new Vec(mouse) })
            holding.x = mouse.x;
            holding.y = mouse.y;
            redoQueue = [];
        }

        click = false;
    }

    function render() {
        ctx.clearRect(0, 0, c.width, c.height);

        ctx.strokeStyle = picker.dataset.value;
        ctx.lineWidth = 5;
        ctx.beginPath();
        for (let point of points) {
            ctx.lineTo(point.x * c.width, point.y * c.height);
        }
        ctx.stroke();

        ctx.fillStyle = "lime";
        ctx.beginPath();
        if (helper.checked) {
            for (let point of points) {
                ctx.moveTo(point.x * c.width, point.y * c.height);
                ctx.arc(point.x * c.width, point.y * c.height, 2, 0, 2 * Math.PI);
            }
        }
        ctx.fill();

        if (line.checked && points.length > 0) {
            ctx.strokeStyle = "lightgrey";
            ctx.beginPath();
            ctx.lineTo(points[points.length - 1].x * c.width, points[points.length - 1].y * c.height);
            ctx.lineTo(mouse.x * c.width, mouse.y * c.height);
            ctx.stroke();
        }

        if (points.length > 1) {
            ctx.strokeStyle = "lightblue";
            ctx.beginPath();
            ctx.lineTo(points[points.length - 1].x * c.width, points[points.length - 1].y * c.height);
            ctx.lineTo(points[0].x * c.width, points[0].y * c.height);
            ctx.stroke();
        }

        if (points.length > 0) {
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(points[points.length - 1].x * c.width, points[points.length - 1].y * c.height, 3, 0, 2 * Math.PI);
            ctx.fill();
        }

    }

    main();

})();
