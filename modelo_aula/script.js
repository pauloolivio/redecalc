let chart;

function calcCreq(material) {
    return material.Cr + material.Mo + 1.5 * material.Si + 0.5 * material.Others;
}

function calcNieq(material) {
    return material.Ni + 30 * material.C + 0.5 * material.Mn;
}

function calcWeld(mb, ma, dilution) {
    const mbCreq = calcCreq(mb);
    const mbNieq = calcNieq(mb);
    const maCreq = calcCreq(ma);
    const maNieq = calcNieq(ma);
    const creqWeld = dilution * mbCreq + (1 - dilution) * maCreq;
    const nieqWeld = dilution * mbNieq + (1 - dilution) * maNieq;
    return [creqWeld, nieqWeld];
}

function getInputValues(prefix) {
    return {
        name: document.getElementById(prefix + 'Material').value,
        type: document.getElementById(prefix + 'Type').value,
        C: parseFloat(document.getElementById(prefix + 'C').value),
        Cr: parseFloat(document.getElementById(prefix + 'Cr').value),
        Ni: parseFloat(document.getElementById(prefix + 'Ni').value),
        Mo: parseFloat(document.getElementById(prefix + 'Mo').value),
        Mn: parseFloat(document.getElementById(prefix + 'Mn').value),
        Si: parseFloat(document.getElementById(prefix + 'Si').value),
        N: parseFloat(document.getElementById(prefix + 'N').value),
        Cu: parseFloat(document.getElementById(prefix + 'Cu').value),
        Others: parseFloat(document.getElementById(prefix + 'Others').value)
    };
}

function calculateAndPlot() {
    const dilution = parseFloat(document.getElementById('dilution').value);
    const baseMetal = getInputValues('base');
    const fillerMetal = getInputValues('filler');

    const mbCreq = calcCreq(baseMetal);
    const mbNieq = calcNieq(baseMetal);
    const maCreq = calcCreq(fillerMetal);
    const maNieq = calcNieq(fillerMetal);
    const weld = calcWeld(baseMetal, fillerMetal, dilution);

    document.getElementById('baseMetalResult').textContent = `Metal de Base: ${baseMetal.name}, Creq: ${mbCreq.toFixed(1)}%, Nieq: ${mbNieq.toFixed(1)}%, Tipo: ${baseMetal.type}`;
    document.getElementById('fillerMetalResult').textContent = `Metal de Adição: ${fillerMetal.name}, Creq: ${maCreq.toFixed(1)}%, Nieq: ${maNieq.toFixed(1)}%, Tipo: ${fillerMetal.type}`;
    document.getElementById('weldResult').textContent = `Junta soldada: Creq: ${weld[0].toFixed(1)}%, Nieq: ${weld[1].toFixed(1)}%`;

    updateChart(mbCreq, mbNieq, maCreq, maNieq, weld[0], weld[1]);
}

function updateChart(mbCreq, mbNieq, maCreq, maNieq, weldCreq, weldNieq) {
    if (chart) {
        chart.destroy();
    }

    const ctx = document.getElementById('schaefflerChart').getContext('2d');
    
    const backgroundImage = new Image();
    backgroundImage.src = 'schaeffler_diagram.png'; // Certifique-se de que o nome do arquivo está correto
    
    backgroundImage.onload = function() {
        chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Metal de Base',
                    data: [{x: mbCreq, y: mbNieq}],
                    backgroundColor: 'blue',
                    pointStyle: 'triangle'
                }, {
                    label: 'Metal de Adição',
                    data: [{x: maCreq, y: maNieq}],
                    backgroundColor: 'red',
                    pointStyle: 'triangle'
                }, {
                    label: 'Solda',
                    data: [{x: weldCreq, y: weldNieq}],
                    backgroundColor: 'green',
                    pointStyle: 'circle'
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Cromo Equivalente (%)'
                        },
                        min: 0,
                        max: 40
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Níquel Equivalente (%)'
                        },
                        min: 0,
                        max: 30
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Diagrama de Schaeffler'
                    },
                    background: {
                        beforeDraw: (chart) => {
                            const ctx = chart.canvas.getContext('2d');
                            ctx.drawImage(backgroundImage, 0, 0, chart.width, chart.height);
                        }
                    }
                }
            }
        });
    };
}

// Inicializar o gráfico quando a página carregar
window.onload = calculateAndPlot;
