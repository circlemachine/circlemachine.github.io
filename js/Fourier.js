const Fourier = {
    Complex: class {
        constructor(real, imag) {
            this.real = real;
            this.imag = imag;
        }

        add(complex) {
            return new Fourier.Complex(this.real + complex.real, this.imag + complex.imag);
        }
    },
    DFT: (values) => {
        // Based on the implementation by Paul Bourke
        // http://paulbourke.net/miscellaneous/dft/
        let output = [];
        for (let i in values) {
            output[i] = new Fourier.Complex(0, 0);
            let arg = -2 * Math.PI * i / values.length;
            for (let k in values) {
                let cos = Math.cos(k * arg);
                let sin = Math.sin(k * arg);
                let val = values[k];
                output[i] = output[i].add(new Fourier.Complex(val.real * cos - val.imag * sin, val.real * sin + val.imag * cos));
            }
        }
        return output;
    }
};
