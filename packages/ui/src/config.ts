// config
import Page from './q-page/src/formSchema';
import Container from './q-container/src/formSchema';
import Button from './q-button/src/formSchema';
import Demo from './q-demo/src/formSchema';
import Img from './q-img/src/formSchema';
import Text from './q-text/src/formSchema';
import Video from './q-video/src/formSchema';

// events
import pageEvents from './q-page/src/event';
import demoEvents from './q-demo/src/event';
import textEvents from './q-text/src/event';
import overlayEvents from './q-overlay/src/event';

const formSchemas = { // 和组件导出名保持一致
    Page,
    Container,
    Button,
    Demo,
    Img,
    Text,
    Video,
};

const events = { // 和组件导出名保持一致
    'Page': pageEvents,
    'Demo': demoEvents,
    'Text': textEvents,
    'OverlayContainer': overlayEvents,
};

export {
    formSchemas,
    events
};

export default formSchemas;
