declare module 'parse-json' {
    function parseJson(input: string, reviver?: (key: any, value: any) => any): any;
    export = parseJson;
  }