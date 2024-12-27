declare module 'js-cookie' {
    interface CookieAttributes {
      expires?: number | Date;
      path?: string;
      domain?: string;
      secure?: boolean;
      sameSite?: 'Strict' | 'Lax' | 'None';
    }
  
    function get(name: string): string | undefined;
    function set(name: string, value: string, options?: CookieAttributes): void;
    function remove(name: string, options?: CookieAttributes): void;
  
    export { get, set, remove, CookieAttributes };
  }
  