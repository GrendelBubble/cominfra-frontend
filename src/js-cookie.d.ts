declare module 'js-cookie' {
    interface CookieAttributes {
      expires?: number | Date;
      path?: string;
      domain?: string;
      secure?: boolean;
      sameSite?: 'strict' | 'lax' | 'none';
    }
  
    function get(name: string): string | undefined;
    function set(name: string, value: string, options?: CookieAttributes): void;
    function remove(name: string, options?: CookieAttributes): void;
  
    export { get, set, remove, CookieAttributes };
  }
  