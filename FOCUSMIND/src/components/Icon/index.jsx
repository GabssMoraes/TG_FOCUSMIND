import React from 'react';

const ICON_MAP = {
    dashboard: 'fa-solid fa-house',
    home: 'fa-solid fa-house',
    timer: 'fa-solid fa-stopwatch',
    clock: 'fa-solid fa-clock',
    calendar: 'fa-solid fa-calendar-days',
    timeblocking: 'fa-solid fa-calendar-days',
    review: 'fa-solid fa-pen-to-square',
    revisao: 'fa-solid fa-pen-to-square',
    bot: 'fa-solid fa-robot',
    chat: 'fa-solid fa-robot',
    shop: 'fa-solid fa-store',
    loja: 'fa-solid fa-store',
    coins: 'fa-solid fa-coins',
    moedas: 'fa-solid fa-coins',
    fire: 'fa-solid fa-fire',
    streak: 'fa-solid fa-fire',
    logout: 'fa-solid fa-right-from-bracket',
    user: 'fa-solid fa-user',
    profile: 'fa-solid fa-user',
    plus: 'fa-solid fa-plus',
    add: 'fa-solid fa-plus',
    check: 'fa-solid fa-check',
    complete: 'fa-solid fa-check',
    trash: 'fa-solid fa-trash',
    delete: 'fa-solid fa-trash',
    target: 'fa-solid fa-bullseye',
    meta: 'fa-solid fa-bullseye',
    brain: 'fa-solid fa-brain',
    reflection: 'fa-solid fa-brain',
    history: 'fa-solid fa-clock-rotate-left',
    headphones: 'fa-solid fa-headphones',
    star: 'fa-solid fa-star',
    play: 'fa-solid fa-play',
    pause: 'fa-solid fa-pause',
    redo: 'fa-solid fa-rotate-right',
    volume: 'fa-solid fa-volume-high',
    volumeMute: 'fa-solid fa-volume-xmark',
    info: 'fa-solid fa-circle-info',
    trophy: 'fa-solid fa-trophy',
    handWave: 'fa-solid fa-hand',
    gift: 'fa-solid fa-gift',
    box: 'fa-solid fa-box-open',
    book: 'fa-solid fa-book',
    xmark: 'fa-solid fa-xmark',
    cross: 'fa-solid fa-xmark',
    pen: 'fa-solid fa-pen',
    tree: 'fa-solid fa-tree'
};

export default function Icon({ name, className = '', style = {}, ...props }) {
    const iconClass = ICON_MAP[name] || name; // Fallback to name if not in map
    return (
        <i
            className={`${iconClass} ${className}`}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}
            {...props}
        />
    );
}
