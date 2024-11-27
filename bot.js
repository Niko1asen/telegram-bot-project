import TelegramBot from 'node-telegram-bot-api';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

//Ссылка на бота: t.me/Olymp1asBot
const token = '8191957257:AAEEyXQSL_U0bgXLBoU333YPhmfJS6hJgjk';
const bot = new TelegramBot(token, { polling: true });

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Добро пожаловать! Я помогу вам узнать об олимпиадах.', {
        reply_markup: {
            keyboard: [
                [{ text: 'В каких олимпиадах я могу поучаствовать на сегодняшний день?' }]
            ]
        }
    });
});

bot.onText(/В каких олимпиадах я могу поучаствовать на сегодняшний день\?/, (msg) => {
    function fetchOlympiads() {
        try {
            //TODO: Сделать ссылки для второго сайта (olimpiada.ru)
            const links = {
                otlichnik: [
                    'https://konkurs-otlichnik.ru/math',
                    'https://konkurs-otlichnik.ru/rus',
                    'https://konkurs-otlichnik.ru/eng',
                    'https://konkurs-otlichnik.ru/inf',
                    'https://konkurs-otlichnik.ru/chemistry',
                    'https://konkurs-otlichnik.ru/physics',
                    'https://konkurs-otlichnik.ru/biology',
                    'https://konkurs-otlichnik.ru/history'
                ]
            }

            fetch(links.otlichnik[1])
            .then(response => {
                if (!response.ok) {
                    throw new Error('Сетевой ответ не был успешным.');
                }
                return response.text();
            })
            .then(text => {
                // Создаем новый документ с помощью JSDOM
                const dom = new JSDOM(text);
                const document = dom.window.document;

                // Ищем элемент с нужным селектором
                const olympiadNames = document.querySelectorAll('.block-content > .field.field--name-body.field--type-text-with-summary.field--label-hidden.field-item > ul > li');
                const olympiadStartDates = document.querySelectorAll('.w70 > .contest-header__dates > .contest-header__date-from');
                const olympiadEndDates = document.querySelectorAll('.w70 > .contest-header__dates > .contest-header__date-till');
                const olympiadStage = document.querySelectorAll('.w30 > .contest-header__contest-name');
                const olympiadList = [];
                //TODO: Сделать даты для второго сайта (olimpiada.ru)
                const olympiadInfo = {
                    olympiadDate: [],
                    olympiadStage: []
                };

                // Итерируемся по найденным элементам и добавляем текст в массивы
                olympiadNames.forEach((element, index) => {
                    if (element && element.textContent && element.textContent.trim() !== 'Франц. язык') {
                        olympiadList.push(element.textContent.trim());
                
                        if (olympiadStartDates[index] && olympiadStartDates[index].textContent) {
                            olympiadInfo.olympiadDate.push(olympiadStartDates[index].textContent.trim());
                        }
                
                        if (olympiadEndDates[index] && olympiadEndDates[index].textContent) {
                            olympiadInfo.olympiadDate.push(olympiadEndDates[index].textContent.trim());
                        }
                        
                        if (olympiadStage[index] && olympiadStage[index].textContent) {
                            olympiadInfo.olympiadStage.push(olympiadStage[index].textContent.trim());
                        }
                    }
                });

                const chatId = msg.chat.id;
                bot.sendMessage(chatId, 'Вот такие олимпиады доступны на сегодняшний день, приятного участия!');
                
                setTimeout(() => {
                    for (let i = 0; i < olympiadList.length; i++) {
                        if (olympiadList.length > 0) {
                            bot.sendMessage(chatId, `<u><a href="${links.otlichnik[i]}">${olympiadList[i] + '\n'}</a></u>` 
                                + '\n<b>Время проведения:</b> ' + olympiadInfo.olympiadDate[0] + ' ' + olympiadInfo.olympiadDate[1] + 
                                '\n<b>Текущий этап:</b> ' + olympiadInfo.olympiadStage, { parse_mode: 'HTML' });
                        } else {
                            bot.sendMessage(chatId, 'К сожалению, на данный момент нет доступной информации об олимпиадах.');
                        }
                    }
                }, 2000);

            })
            .catch(error => console.error('Ошибка:', error));         
        } 
        catch (error) {
            console.error('Ошибка:', error);
             bot.sendMessage(chatId, 'Произошла ошибка при получении информации. Попробуйте снова позже.');
        }
    }
    fetchOlympiads();
    bot.sendMessage(chatId, response);
});

// Игнорируем все остальные сообщения
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
});