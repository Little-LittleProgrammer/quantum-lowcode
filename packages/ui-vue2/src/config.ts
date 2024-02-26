// config
import Page from './q-page/src/formSchema';
import Container from './q-container/src/formSchema';
import Demo from './q-demo/src/formSchema';
import Button from './q-button/src/formSchema';
import Img from './q-img/src/formSchema';

// events
import pageEvents from './q-page/src/event';
import demoEvents from './q-demo/src/event';

const formSchemas = { // 和组件导出名保持一致
    Page,
    Container,
    Demo,
    Button,
    Img,
};

const events = { // 和组件导出名保持一致
    'Page': pageEvents,
    'Demo': demoEvents,
};

export {
    formSchemas,
    events
};
