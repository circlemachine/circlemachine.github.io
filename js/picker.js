let picker = (function() {

    let pickers = document.getElementsByClassName("picker");

    for (let picker of pickers) {
        picker.style.backgroundColor = picker.dataset.value;

        picker.onclick = () => {
            let fade = document.createElement("div");
            fade.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
            fade.style.position = "absolute";
            fade.style.top = "0";
            fade.style.left = "0";
            fade.style.width = "100%";
            fade.style.height = "100%";
            document.body.appendChild(fade);

            let container = document.createElement("div");
            let size = Math.max(innerHeight / 2, 580);
            container.style.width = size + "px";
            container.style.height = size + "px";
            container.style.position = "absolute";
            container.style.left = `calc(50% - ${size / 2}px)`;
            container.style.top = `calc(50% - ${size / 2}px)`;
            container.style.backgroundColor = "#222229";
            container.style.borderRadius = "10px";
            container.style.boxSizing = "border-box";
            container.style.padding = "10px";
            container.style.textAlign = "center";
            document.body.appendChild(container);

            let c = document.createElement("canvas");
            c.style.backgroundColor = "rgba(0, 0, 0, 0)";
            c.width = size - 20;
            c.height = size - 120;
            container.appendChild(c);
            let ctx = c.getContext("2d");

            let hue = 0;
            let saturation = 100;
            let lightness = 50;

            let click = (x, y) => {
                if (x != -1) {
                    if (x < c.width - 100) {
                        lightness = x / (c.width - 100) * 100 | 0;
                        saturation = y / c.height * 100 | 0;
                    } else if (x > c.width - 70 && y < c.height - 100) {
                        hue = y / (c.height - 100) * 360 | 0;
                    }
                }

                for (let x = 0; x < c.width - 100; x++) {
                    for (let y = 0; y < c.height; y++) {
                        ctx.fillStyle = `hsl(${hue}, ${y / c.height * 100 | 0}%, ${x / (c.width - 100) * 100 | 0}%)`;
                        ctx.fillRect(x, y, 1, 1);
                    }
                }

                for (let y = 0; y < c.height - 100; y++) {
                    ctx.fillStyle = `hsl(${y / (c.height - 100) * 360 | 0}, 100%, 50%)`;
                    ctx.fillRect(c.width - 70, y, 70, 1);
                }

                ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                ctx.fillRect(c.width - 70, c.height - 70, 70, 70)
            }

            c.onclick = e => {
                let rect = c.getBoundingClientRect();
                click(e.pageX - rect.x, e.pageY - rect.y);
            }
            click(-1, -1);

            container.appendChild(document.createElement("br"));

            let pick = document.createElement("input");
            pick.type = "button";
            pick.value = "Pick";
            container.appendChild(pick);

            pick.onclick = () => {
                document.body.removeChild(container);
                document.body.removeChild(fade);
                let color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                picker.dataset.value = color;
                picker.style.backgroundColor = color;
            }
        };
    }

}());
