import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

export let options = {
    vus: 10, // nombre d'utilisateurs virtuels
    duration: '30s', // durée du test
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% des requêtes doivent répondre en moins de 500ms
        http_req_failed: ['rate<0.01'], // taux d'erreur < 1%
        http_reqs: ['rate>10'], // au moins 10 requêtes/seconde
    },
};

let latency = new Trend('latency');

export default function () {
    let res = http.get('https://votre-api-cible.com/endpoint');
    latency.add(res.timings.duration);

    check(res, {
        'status is 200': (r) => r.status === 200,
    });

    sleep(1);
}

export function handleSummary(data) {
    return {
        'resultats.html': htmlReport(data), // Nécessite l'installation de k6-reporter (optionnel)
        stdout: JSON.stringify({
            'Latence moyenne (ms)': data.metrics.latency ? data.metrics.latency.avg : data.metrics.http_req_duration.avg,
            'Taux d\'erreur (%)': data.metrics.http_req_failed.rate * 100,
            'Requêtes/seconde': data.metrics.http_reqs.rate,
            'Temps de réponse max (ms)': data.metrics.http_req_duration.max,
        }, null, 2)
    };
}

// Pour un rapport HTML, installer k6-reporter : https://github.com/benc-uk/k6-reporter
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';