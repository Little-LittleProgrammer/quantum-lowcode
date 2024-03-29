import { IPageData } from '../../global';

export type IGlobalSelect = ISelectList<'projectOptions'>

export interface IH5ManageData {
    list: IH5ManageList[];
    page_data: IPageData;
    table_header: IH5ManageTableHeader;
}

export interface IH5ManageList {
    __v?: number;
    activity?: string;
    createTime?: string;
    id?: string;
    pageJson?: string;
    projectNameCh?: string;
    projectNameEn?: string;
    status?: number;
    title?: string;
    updateTime?: string;
    designWidth?: number;
    description?: {
        keywords?: string[]
        description?: string[]
    }
}

export interface IH5ManageTableHeader {
    activity: string;
    pageJson: string;
    projectNameCh: string;
    status: string;
    title: string;
    updateTime: string;
}
