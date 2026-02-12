import { describe, expect, it } from "@jest/globals";
import { encodeHTML } from "../src/common/html.js";

describe("Test html.js", () => {
  it("should test encodeHTML", () => {
    expect(encodeHTML(`<html>hello world<,.#4^&^@%!))`)).toBe(
      "&#60;html&#62;hello world&#60;,.#4^&#38;^@%!))",
    );
  });

  it("should encode quotes", () => {
    expect(encodeHTML(`"hello" & 'world'`)).toBe(
      "&#34;hello&#34; &#38; &#39;world&#39;",
    );
  });

  it("should strip control characters", () => {
    expect(encodeHTML("hello\x00\x08world")).toBe("helloworld");
  });

  it("should encode non-ASCII characters", () => {
    expect(encodeHTML("café")).toBe("caf&#233;");
  });
});
