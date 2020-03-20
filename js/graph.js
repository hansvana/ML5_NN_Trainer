class lineGraph {
    constructor(element) {
        this.canvas = document.querySelector(element);
        this.context = this.canvas.getContext("2d");
        this.lineStyle = { width: 1, color: "#FF0000" };
        this.margins = { x: 50, y: 50 };
        this.size = this.setSize();
        this.xAxis = {};
        this.yAxis = {};
        this.mouse = {};
        this.header = "";

        this.dataset = [];

        this.canvas.addEventListener('mousemove', evt => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse = {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            }
            this.draw();
        });

        this.canvas.addEventListener('mouseout', evt => {
            this.mouse = {};
        });

        return this;
    }

    setMargins(obj) {
        this.margins = obj;
        this.size = this.setSize();

        return this;
    }

    setXAxis(obj) {
        this.setAxis(this.xAxis, obj);
        return this;
    }

    setYAxis(obj) {
        this.setAxis(this.yAxis, obj);
        return this;
    }

    setAxis(axis, obj) {
        if (obj.label)
            axis.label = obj.label;
        if (obj.range) {
            axis.min = obj.range[0];
            axis.max = Math.max(1, obj.range[1]);
        }
    }

    setData(arr) {
        this.dataset = arr;

        return this;
    }

    addData(obj) {
        this.dataset.push(obj);

        return this;
    }

    setSize() {
        return {
            width: this.canvas.width - (this.margins.x * 2),
            height: this.canvas.height - (this.margins.y * 2)
        }
    }

    setLineStyle(obj) {
        if (obj.color) this.lineStyle.color = obj.color;
        if (obj.width) this.lineStyle.width = obj.width;
        return this;
    }

    setHeader(string) {
        this.header = string;

        return this;
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.strokeStyle = this.lineStyle.color;
        this.context.lineWidth = this.lineStyle.width;
        if (this.dataset.length > 0) {
            this.path(this.dataset);
        }

        this.context.strokeStyle = "#000";
        this.context.lineWidth = 1;
        this.context.textAlign = "center";
        if (this.xAxis) {
            this.line(this.margins.x, this.margins.y + this.size.height, this.margins.x + this.size.width, this.margins.y + this.size.height);
            this.context.fillText(this.xAxis.label, this.canvas.width / 2, this.canvas.height - (this.margins.y / 2));
            const n = this.xAxis.max - this.xAxis.min;
            for (let i = this.xAxis.min; i <= this.xAxis.max; i++) {
                this.line(this.xScale(i), this.margins.y + this.size.height, this.xScale(i), this.margins.y + this.size.height + 5);
                if (n <= 10 || (n < 25 && i % 5 == 0) || (n < 100 && i % 10 == 0)) this.context.fillText(i, this.xScale(i), this.margins.y + this.size.height + 20);
            }
        }
        if (this.yAxis) {
            this.line(this.margins.x, this.margins.y, this.margins.x, this.margins.y + this.size.height);
            this.context.fillText(this.yAxis.label, this.margins.x / 2, this.canvas.height / 2);
            const n = this.yAxis.max - this.yAxis.min;
            for (let i = this.yAxis.min; i <= this.yAxis.max; i++) {
                this.line(this.margins.x, this.yScale(i), this.margins.x - 5, this.yScale(i));
                if (n <= 10 || (n < 25 && i % 5 == 0) || (n < 100 && i % 10 == 0)) this.context.fillText(i, this.margins.x - 10, this.yScale(i));
            }
        }
        if (this.header) {
            this.context.fillText(this.header, this.canvas.width / 2, this.margins.y / 2);
        }
        if (this.mouse) {
            const closest = this.getClosestPoint(this.mouse)
            this.circle(closest, 5);
            this.context.fillText(closest.label, closest.x, closest.y - 10);
        }


        return this;
    }

    line(startX, startY, endX, endY) {
        this.context.beginPath();
        this.context.moveTo(startX, startY);
        this.context.lineTo(endX, endY);
        this.context.stroke();
    }

    path(points) {
        this.context.beginPath();
        this.context.moveTo(this.xScale(points[0].x), this.yScale(points[0].y));
        for (let i = 0; i < points.length; i++)
            this.context.lineTo(this.xScale(points[i].x), this.yScale(points[i].y));
        this.context.stroke();
    }

    circle(pos, w) {
        this.context.beginPath();
        this.context.arc(pos.x, pos.y, w, 0, 2 * Math.PI);
        this.context.stroke();
    }

    xScale(val) {
        const scale = this.size.width / (this.xAxis.max - this.xAxis.min);
        return (val - this.xAxis.min) * scale + this.margins.x;
    }

    yScale(val) {
        const scale = this.size.height / (this.yAxis.max - this.yAxis.min);
        return (this.yAxis.max - val) * scale + this.margins.y;
    }

    getClosestPoint(origin) {
        let minDist = Infinity;
        let result = {};

        let scaledX, scaledY, dist;
        this.dataset.forEach(point => {
            scaledX = this.xScale(point.x);
            scaledY = this.yScale(point.y);
            dist = Math.sqrt(Math.pow((scaledX - origin.x), 2) + Math.pow((scaledY - origin.y), 2));
            if (dist < minDist) {
                minDist = dist;
                result = { x: scaledX, y: scaledY, label: this.xAxis.label + " " + point.x + " - " + this.yAxis.label + " " + point.y };
            }
        })

        return result;
    }

    static getMaxVal(arr, key) {
        let highest = 0;
        arr.forEach(val => {
            if (val[key] > highest) {
                highest = val[key];
            }
        })
        return highest;
    }

}

// const dataset = [{ x: 1, y: 1.6 }, { x: 2, y: 1.2 }, { x: 3, y: 0.7 }, { x: 4, y: 0.6 }, { x: 5, y: 0.8 }];

// const graph = new lineGraph("#graphcanvas")
//     .setMargins({ x: 100, y: 100 })
//     .setData(dataset)
//     .setXAxis({ label: "epoch", range: [1, lineGraph.getMaxVal(dataset, "x")] })
//     .setYAxis({ label: "loss", range: [0, lineGraph.getMaxVal(dataset, "y")] })
//     .setLineStyle({ width: 5, color: "#BADA55" })
//     .setHeader(`epoch: 5 - loss 0.8`)
//     .draw();

// window.setInterval(() => {
//     const epoch = graph.dataset.length + 1;
//     const loss = Math.random().toFixed(2);
//     graph.addData({ x: epoch, y: loss })
//         .setXAxis({ range: [1, lineGraph.getMaxVal(dataset, "x")] })
//         .setYAxis({ range: [0, lineGraph.getMaxVal(dataset, "y")] })
//         .setHeader(`epoch: ${epoch} - loss ${loss}`)
//         .draw();
// }, 1000);