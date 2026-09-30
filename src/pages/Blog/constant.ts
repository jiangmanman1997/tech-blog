/**
 * 文章相关的常量
 */

export enum POST_TAG{
    /** 随笔 */
    Essay = 'Essay',
    /** 前端 */
    Frontend = 'Frontend',
    /** React */
    React = 'React',
    /** TypeScript */
    TypeScript = 'TypeScript',
    /** Webpack */
    Webpack = 'Webpack',
    /** CSS */
    CSS = 'CSS',
    /** 性能优化 */
    Performance = 'Performance',
    /** 工程化 */
    Engineering = 'Engineering',
    /** AI */
    AI = 'AI',
    /** Agent */
    Agent = 'Agent',
    /** node.js */
    Nodejs = 'Nodejs',
    /** Express */
    Express = 'Express',
    /** JavaScript */
    JavaScript = 'JavaScript',
    /** 后端 */
    Backend = 'Backend',
}

export const PostTagLabelMap: Record<string, { text: string,icon?:string }> = {
    [POST_TAG.Essay]: {text:'随笔',icon:'icon-icon-suibi'},
    [POST_TAG.Frontend]: {text:'前端',icon:'icon-icon-test'},
    [POST_TAG.React]: {text:'React',icon:'icon-React'},
    [POST_TAG.TypeScript]: {text:'TypeScript',icon:'icon-Typescript'},
    [POST_TAG.Webpack]: {text:'Webpack',icon:'icon-webpack'},
    [POST_TAG.CSS]: {text:'CSS',icon:''},
    [POST_TAG.Performance]: {text:'性能优化',icon:'icon-xingneng'},
    [POST_TAG.Engineering]: {text:'工程化',icon:'icon-gongcheng'},
    [POST_TAG.AI]: {text:'AI',icon:'icon-agent'},
    [POST_TAG.Agent]: {text:'Agent',icon:'icon-agent'},
    [POST_TAG.Nodejs]: {text:'node.js',icon:'icon-nodejs'},
    [POST_TAG.Express]: {text:'Express',icon:''},
    [POST_TAG.JavaScript]: {text:'JavaScript',icon:'icon-javascript'},
    [POST_TAG.Backend]: {text:'后端',icon:'icon-houduankaifa'},
};
export const POST_TAGS = Object.entries(PostTagLabelMap).map(([value, label]) => ({ value, label:label.text }));