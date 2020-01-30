import verifyToken from '../index';
import * as signatureVerifier from '../signatureVerifier';
const jwtDecoder = require('jwt-decode');
import * as fs from 'fs';
import * as path from 'path';
import fetchMock from 'fetch-mock';

describe('id token verification tests', () => {
  describe('token signature verification', () => {
    beforeEach(() => {
      fetchMock.restore();
    });

    it('resolves when no idToken present', async () => {
      await expect(verify(undefined)).resolves.toBeUndefined();
    });

    it('fails when token not signed with RS256 or HS256', async () => {
      const badAlgToken =
        'eyJhbGciOiJub25lIn0.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC05OTkiXSwiZXhwIjoxODEzMS42MjAzNTMxNTk3MjQsImlhdCI6LTE4MTMxLjYyMDM1MzE1OTcyNCwibm9uY2UiOiJhMWIyYzNkNGU1IiwiYXpwIjoidG9rZW5zLXRlc3QtMTIzIiwiYXV0aF90aW1lIjoxNTY2NTcxOTk4LjUxM30.';

      await expect(verify(badAlgToken)).rejects.toHaveProperty(
        'name',
        'a0.idtoken.invalid_algorithm',
      );
    });

    it('fails when unable to decode token', async () => {
      const testJwt = "won't work";

      await expect(verify(testJwt)).rejects.toHaveProperty(
        'name',
        'a0.idtoken.token_decoding_error',
      );
    });

    it('fails when discovery endpoint returns error', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQifQ.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTcwMjAyOTMxLCJpYXQiOjE1NzAwMzAxMzEsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOiJ0b2tlbnMtdGVzdC0xMjMiLCJhdXRoX3RpbWUiOjE1NzAxMTY1MzAuNzk2fQ.Xad-J3PtImY3z--Gvj-H61tH18mCGQUUBkcug-CB5ehkjd56PXrA-AJHZK7OLryB_uj6sFKVn-V8Wr6t3KW7_Fd2n-__Ca2h6PtgIrjceZlHAQY4SgAk9tPmeeTOhs6KyXDeW0Ot0j3CP9p7nWxgCGMu_H5J5ZgJSVUVlffVpaIMEGiFZ_r71PLPtuTL3GsDwtICG_5xuqoR2YBLSpNuuc46t15i94E3JC1UXGryRfxVbeHg3x5DF9nf6eVkMHRdi-CdNQn2iD0G9OmxxELh-40pecbyUxLv4NfTHmbxOdvWRK00N8sgkElnPnoWXb5pacxLShFsBTJdXIsyqF_onA';

      fetchMock.get(
        `${BASE_EXPECTATIONS.issuer}.well-known/openid-configuration`,
        500,
      );

      const result = verify(testJwt);

      expect(result).rejects.toHaveProperty(
        'name',
        'a0.idtoken.key_retrieval_error',
      );
      expect(result).rejects.toHaveProperty(
        'message',
        'Could not find a public key for Key ID (kid) "1234"',
      );
    });

    it('fails when jwk set does not contain the expected key id', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQifQ.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTcwMjAyOTMxLCJpYXQiOjE1NzAwMzAxMzEsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOiJ0b2tlbnMtdGVzdC0xMjMiLCJhdXRoX3RpbWUiOjE1NzAxMTY1MzAuNzk2fQ.Xad-J3PtImY3z--Gvj-H61tH18mCGQUUBkcug-CB5ehkjd56PXrA-AJHZK7OLryB_uj6sFKVn-V8Wr6t3KW7_Fd2n-__Ca2h6PtgIrjceZlHAQY4SgAk9tPmeeTOhs6KyXDeW0Ot0j3CP9p7nWxgCGMu_H5J5ZgJSVUVlffVpaIMEGiFZ_r71PLPtuTL3GsDwtICG_5xuqoR2YBLSpNuuc46t15i94E3JC1UXGryRfxVbeHg3x5DF9nf6eVkMHRdi-CdNQn2iD0G9OmxxELh-40pecbyUxLv4NfTHmbxOdvWRK00N8sgkElnPnoWXb5pacxLShFsBTJdXIsyqF_onA';

      const jwks = getExpectedJwks();
      jwks.keys[0].kid = '4321';

      setupFetchMock({jwks});
      const result = verify(testJwt);

      expect(result).rejects.toHaveProperty(
        'name',
        'a0.idtoken.key_retrieval_error',
      );
      expect(result).rejects.toHaveProperty(
        'message',
        'Could not find a public key for Key ID (kid) "1234"',
      );
    });

    it('fails when public key is invalid and cannot be reconstructed', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQifQ.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTcwMjAzMjgxLCJpYXQiOjE1NzAwMzA0ODEsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOiJ0b2tlbnMtdGVzdC0xMjMiLCJhdXRoX3RpbWUiOjE1NzAxMTY4ODAuNjk0fQ.ZNPsQq_U8NGyi5WFNgvuT0QlxfGFS9w6YIHWiF4dnwz_Zf3mv3gh4wybDR8vaLCE8ONTXvT9V_rW6oqNHSvEwa0nvPy2Vi3gVAvSfusoiYhkuQG_6SuqbeOrNJ1cejGzqw_iv2s6yEyN3B9wp0TCuIKL5jLPttaRi6ouGCbYeReANecaLOVZstrO4GhlY0NwtT4j5Dn1tDYavWxi1DZBisxBvMEFA6N0aQa51gJm6RYtUjBTo50j1xG5b7TIF4edjjT85FYQgrwEzA7Ss3HpnrYXEEvHn4nCsc585T3GKQuF21Nli-qGgQ3MywPOOqqiCSvL254Cp88Gt3xDS1hnqg';
      const jwks = getExpectedJwks();
      jwks.keys[0].n = 'bad-modulus';

      setupFetchMock({jwks});

      const result = verify(testJwt);
      expect(result).rejects.toHaveProperty(
        'name',
        'a0.idtoken.invalid_signature',
      );
      expect(result).rejects.toHaveProperty(
        'message',
        'Invalid ID token signature',
      );
    });

    it('fails when signature is invalid', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQifQ.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTcwMjAzMjgxLCJpYXQiOjE1NzAwMzA0ODEsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOiJ0b2tlbnMtdGVzdC0xMjMiLCJhdXRoX3RpbWUiOjE1NzAxMTY4ODAuNjk0fQ.invalid-signature';

      setupFetchMock();

      await expect(verify(testJwt)).rejects.toHaveProperty(
        'name',
        'a0.idtoken.invalid_signature',
      );
    });

    it('passes verification and does not verify signature when signed with HS256', async () => {
      const testJwt =
        'eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3NDg2ODAwLCJpYXQiOjE1NjczMTQwMDAsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOiJ0b2tlbnMtdGVzdC0xMjMiLCJhdXRoX3RpbWUiOjE1NjczMTQwMDB9.9G6ScTYnBDLzI_qGNTXLi33J604tE4oagNVR7vnfaL0';

      setupFetchMock();

      await verify(testJwt);

      expect(fetchMock.called()).toBe(false);
    });

    it('passes verification with valid token signed with RS256', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQifQ.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3NDg2ODAwLCJpYXQiOjE1NjczMTQwMDAsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOiJ0b2tlbnMtdGVzdC0xMjMiLCJhdXRoX3RpbWUiOjE1NjczMTQwMDB9.ObH7oG3NsGaxWnB8rzbLOgAD2I0fr9dyZC81YUrbju3RwC3lRAxqJkbesiSdGKry9OamIhKYwUGpPK0wrBaRJo8UjDjICkhM6lGP23plysemxhDnFK1qjj-NaUaW1yKg14v2lVpQl7glW9LIhFDhpqIf4bILA2wt9-z8Uvi31ETZvGb8PDY2bEvjXR-69-yLuoTNT2skP9loKfz6hHDMQCTWrGA61BMMjkZBLo9UotD9BzN8V7bLrFFT25v6q9N83mWaGLsHntzPIl3EYPOwX0NbE0lXKar59TUqtaTB3uNFHbGjIYi8wuuIp4PV9arpE3YrjWOOmrMurD1KpIyQrQ';

      setupFetchMock();

      await expect(verify(testJwt)).resolves.toBeUndefined();
    });
  });

  describe('token claims verification', () => {
    // default clock skew in seconds
    const DEFAULT_LEEWAY = 60;
    let sigMock;

    beforeEach(() => {
      sigMock = jest.spyOn(signatureVerifier, 'verifySignature');
    });

    afterEach(() => {
      sigMock.mockRestore();
    });

    it('fails when "iss" is missing', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3NDg2ODAwLCJpYXQiOjE1NjczMTQwMDAsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOiJ0b2tlbnMtdGVzdC0xMjMiLCJhdXRoX3RpbWUiOjE1NjczMTQwMDB9.B4PGlucyy-fJ4v5NNK2hntvjAf5m8dJf84WttwVnzV0ZlfPbYUSJm7Vc1ys7iMqXAQzAl2I8bDf2qhtLjaLpDKAH9JUvowUpCL7Bgjd7AEc1Te_IUwwxlpCupgseOEL2nrY8enP6On7BO7BBpngmVwnD1DvuA4lNoaaFyWUopha5Dxd5jw64wMqP4lz13C6Kqs8mINZkkw-NgE8DvWszaXeyPaowy-QpfXmPBnw75YLZlGcjr-WQsWQV7rUezq4Tl_11uPivR-fNcEWdG1mAtsnQnB_zJJKaHYlE0g4fey_6H9FKmCvcNkpBGo9ylbitb7jIuExbFEvEd2r_4wKl0g';

      setupSignatureMock(testJwt);

      await expect(verify(testJwt)).rejects.toHaveProperty(
        'name',
        'a0.idtoken.missing_issuer_claim',
      );
    });

    it('fails when "iss" is not a string', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOjQyLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3NDg2ODAwLCJpYXQiOjE1NjczMTQwMDAsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOiJ0b2tlbnMtdGVzdC0xMjMiLCJhdXRoX3RpbWUiOjE1NjczMTQwMDB9.Fv0hopDxEJ_84UibQLCD9fnyr8jJ-oBg6GyJcSQZHmXgmqDYDMh3KTVUz88EvwmGv6yxoSo5PnkbzgM8Qqcjs9X1K9nvC09y6RIhQ1WzJOAOFRoUMp4yaAjrWfgQOpR21AOTpCQhLaW4EX2hNU5hjYwR1r7jhFb1AjeeOo-VCfKbwn_-GAKH5FF7fjmEdgCPcAX5DD7WIYCKE_oz5X4BbT4G9hEPEE-GxigcHrFZuCaYGwjUFDpT6zWB6_wJLRVQLl42Xjiwl8GasjnTSyF_uPidMANeYj1nA-JzPVYtuvjBr9EsDWylTlpyZe6pq6osZXNIRfv7oPVx9hLeKS8l1w';

      setupSignatureMock(testJwt);

      await expect(verify(testJwt)).rejects.toHaveProperty(
        'name',
        'a0.idtoken.missing_issuer_claim',
      );
    });

    it('fails when "iss" is invalid', async () => {
      const testJwt =
        ' eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJzb21ldGhpbmctZWxzZSIsInN1YiI6ImF1dGgwfDEyMzQ1Njc4OSIsImF1ZCI6WyJ0b2tlbnMtdGVzdC0xMjMiLCJleHRlcm5hbC10ZXN0LTEyMyJdLCJleHAiOjE1Njc0ODY4MDAsImlhdCI6MTU2NzMxNDAwMCwibm9uY2UiOiJhNTl2azU5MiIsImF6cCI6InRva2Vucy10ZXN0LTEyMyIsImF1dGhfdGltZSI6MTU2NzMxNDAwMH0.lHFHyg1ei3hK2vB7X1xB9nqksAEnxtv2KKpE_Gih6RezTruF9uZu1PAZTEwxhfj2UrQxwLqCb-t6wyVnxVpCsymSCq9JIiCVgg_cYV38siMs38N9y26BrVeyifj_VOP9Om_vI_hHjOzhi8WmysK2KKAQnn0skKAkq8epY4axCX3NkRaEIMhhTaITYia3GbJ5Qki8WDD9UVucUVOhgSZBV5p1dL39FKgc9k1MOVZJG-zAd_r5GsUIRk-xUwNX0WYwCR9sC2G-FjJTvlFph_4vksponoUWJ-LPTLM0RwGgmEUPhhnIG23UjsNwpnElY4gWfIL0hsO98-5DpGjn8Ejr0w';

      setupSignatureMock(testJwt);

      await expect(verify(testJwt)).rejects.toHaveProperty(
        'name',
        'a0.idtoken.invalid_issuer_claim',
      );
    });

    it('fails when "sub" is missing', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3NDg2ODAwLCJpYXQiOjE1NjczMTQwMDAsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOiJ0b2tlbnMtdGVzdC0xMjMiLCJhdXRoX3RpbWUiOjE1NjczMTQwMDB9.fDR9NSbbt75w9nzhL-eBfGjOp16HP2vfnO6m_Oav0xrmmgyYsBZSLOPd2C0O46bp6_2hKjeOUhnwYwjocsdXI4hvfQkyACERtneCkwHwSZPZK-1h6vgGF7b_7ILUywEcgo7F6e1qgFTM93Prqk63cCP53KgOBPyx02y0rqkhUOApCWRVBFrfP92tXvFN7E2phmpf9G68PPjwnEvvQtYOGjvFkaWSja7MKT98f7OxgbenBI_mAZy9LmOqUl3SKJOBe5Fibs1snI0l4nzrgQ1GNxVwyfHOdyq-srdGe8rlFx5kdhWh313EOzWxxGTg4RhGY7Tiz1QWago0VQ5yOt0w8A';

      setupSignatureMock(testJwt);

      await expect(verify(testJwt)).rejects.toHaveProperty(
        'name',
        'a0.idtoken.missing_subject_claim',
      );
    });

    it('fails when "sub" is not a string', async () => {
      const testJwt =
        ' eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOjQyLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3NDg2ODAwLCJpYXQiOjE1NjczMTQwMDAsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOiJ0b2tlbnMtdGVzdC0xMjMiLCJhdXRoX3RpbWUiOjE1NjczMTQwMDB9.tWst0Fp-1vN2urV1APmWLpqc2DjyGGeCBuHB7aDd-RKKSx7u65NQrX9EBf9FLmYh763uNlYxjWkZq1Orf8P7pbf2NFjgl2yKHrBU7RadQESLj8TDc1VBQMiXKF4SchjWFo8Yq3we81clbxfWYrzapmpvtUTerfXRuQukJza6CHNSzl3VhgVodtJOPasS11zSQsE7DBtHXGwLZwZ83zuwN_IiaFgVu-jZH8yG1ot5ThZGOqFiW9WUbje9XLTp6w_lQedd16-ll50ExhmzCZAnjK7DweiiH3jWdxK-6m1DeLZMwMPGSpz6BgVYsLfuPmoIHU-3CdRXjSXmuBf-WdSGlg';

      setupSignatureMock(testJwt);

      await expect(verify(testJwt)).rejects.toHaveProperty(
        'name',
        'a0.idtoken.missing_subject_claim',
      );
    });

    it('fails when "aud" is missing', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJleHAiOjE1Njc0ODY4MDAsImlhdCI6MTU2NzMxNDAwMCwibm9uY2UiOiJhNTl2azU5MiIsImF6cCI6InRva2Vucy10ZXN0LTEyMyIsImF1dGhfdGltZSI6MTU2NzMxNDAwMH0.XM-IM9CIZ2cJpZZaKooMSmNgvwHPTse6kcIOPATgewRZxrDdCEjtPHmzmSuyDGy84vSR__DJS_kM2jWWwbkjB_PahXes210dpUqitRW3is9xV0-k0LkVwxmhHCM-e9sClbTbcs4zLv6WWFRq4UEU5DU6HhuHLQeeH0eO2Nv_tkvu-JdpmoepHPjW3ecMs0lhzXRT6_2o-ErTPdYt4W6yqpBG57HRIMzs9F72AWcPC6vhLY0IhMqXaq68Ma3jnEPIXUmv52bll0PuQVBqKd-eDH_jD0ZHFUCkwbfWPrkhJz5Q5qLzSzUjnrWKA3KgP4_Z1KfHY2-nQA2ynMgNFSn_eA';

      setupSignatureMock(testJwt);

      await expect(verify(testJwt)).rejects.toHaveProperty(
        'name',
        'a0.idtoken.missing_audience_claim',
      );
    });

    it('fails when "aud" is not a string or an array', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOjQyLCJleHAiOjE1Njc0ODY4MDAsImlhdCI6MTU2NzMxNDAwMCwibm9uY2UiOiJhNTl2azU5MiIsImF6cCI6InRva2Vucy10ZXN0LTEyMyIsImF1dGhfdGltZSI6MTU2NzMxNDAwMH0.W0dV1Eddi_mr1o9XtGeznhgngXqUnGROoiRaNNpHgLwmyzQTndas7oZZuqnQRWd8W9eNgqjjM5YNP6UG3paEbSpwdwe32IzqhlKqL5Cqf0eMdYTsh1yXxdl7UB3wGccG_2IvdzlgSY-Zs_uZiBMQqksWSwq4V9eF9fCpmwv9yLMf9dkF9VGgR8TSi1-pOVj693rw0ZFFRa5zsB6fgBgkNjP2tqR7zErkDqWwyy2K_N8ArNSfWC3WmYqx7V4yI4pARciQeg36KofHWyyZkZPSIF6DhkxLxeMlc0fx2NC6iBaiqGSe19nJbR1ETuouY7ozMbP42qfm5Yegv-dS_sPswA';

      setupSignatureMock(testJwt);

      await expect(verify(testJwt)).rejects.toHaveProperty(
        'name',
        'a0.idtoken.missing_audience_claim',
      );
    });

    it('fails when "aud" is a string and does not contain the client ID', async () => {
      const testJwt =
        ' eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOiJleHRlcm5hbC10ZXN0LTEyMyIsImV4cCI6MTU2NzQ4NjgwMCwiaWF0IjoxNTY3MzE0MDAwLCJub25jZSI6ImE1OXZrNTkyIiwiYXpwIjoidG9rZW5zLXRlc3QtMTIzIiwiYXV0aF90aW1lIjoxNTY3MzE0MDAwfQ.SxeNIhm8reywgtSSkZ6jCpbZ8KyC09couFjpcrJFktAYKmJZnGQkv0gQLNUuGejORvysznOlhfO2nkF10yT6pKBiye9xZ8TstWQBorDKHL-74n6ZAxjPg1F0vHNokZq0zpPkwV-gKIFY6aPw3vyZTxzR6CMyoJdwc19A0RXPzPt6T7csQeqX0lzGEqqeIbU4VI5XM5RG1VvN82CgTlOQXlFZrKhyJx_xwslyWWDzx7tpPNid1wusvfznTGxoWO2wUBCyW6EhmyHp2euFi1gdJqHQVbrydutPtQ-FGQEwyWACNN8kBWqQ7UEbqimg6C0NTGrRkkKkJ79DmiW7aULHZQ';

      setupSignatureMock(testJwt);

      await expect(verify(testJwt)).rejects.toHaveProperty(
        'name',
        'a0.idtoken.invalid_audience_claim',
      );
    });

    it('fails when "aud" is an array and does not contain the client ID', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3NDg2ODAwLCJpYXQiOjE1NjczMTQwMDAsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOiJ0b2tlbnMtdGVzdC0xMjMiLCJhdXRoX3RpbWUiOjE1NjczMTQwMDB9.EAzP2R_Y8eu1hpJmluV_gjD5WF_y0bSOhtL-GsLTXKHdNmvE9nYsBjemGfNcl_xQVzcpakMD6dL7qtElvT2TuiJQhz0n5uB1DW-DVvWg301fYMqtCE1FlCJJJw7qkKi5WgqPWLkp3QYBuHvC0mPTYkRM5nbHXU3QymJ39koFTR7eq10VeKu9k0dUzwc1Oy_9SnL-mbtUn_0Nx0RFB-0BRkPLdbK1yhnNIUGEUSOJRKpoJz8dBRGyzSZSINxoWOMcclJT2O_o45DZnX8jZpct_XHc6G4_qGJFU3RNUfFoDoyjtK0aU_OFYCYmY41CDYyPj2LKAnhJ2pUdFrz7lxzzEw';

      setupSignatureMock(testJwt);

      await expect(verify(testJwt)).rejects.toHaveProperty(
        'name',
        'a0.idtoken.invalid_audience_claim',
      );
    });

    it('fails when "exp" is missing', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiaWF0IjoxNTY3MzE0MDAwLCJub25jZSI6ImE1OXZrNTkyIiwiYXpwIjoidG9rZW5zLXRlc3QtMTIzIiwiYXV0aF90aW1lIjoxNTY3MzE0MDAwfQ.b6saYAZCnCSzpVO0nrAUKVSC1n3GoqUfwrjOXG5gVxda0oFohpYJe68QwzsTmS4fOm7JtbN1FqjVRN6S4i-BnH-XGnciGOMFF4EfaOzsgo7DCrrLrjfx6rmqW8UPYalbfJTQL8mXYnLOxzMGP3DEXNlk-41GSZoFujwTAIqYjrV_Y3MUGYmzcVxdL_h2psLm_p07knMLCm7Cuo8znzKrU4PtuaLflvzorg57S4BD79oLv4uv0_dmhwPUgJDvqWeicR5Qry4aX2L5BT6V-nBWAcu3qVZDymSKcjtTebxszxY1siyA7BQe88ZmgP1bW1KXtMk_fOGsgWHFdu_AH77yow';

      setupSignatureMock(testJwt);

      await expect(verify(testJwt)).rejects.toHaveProperty(
        'name',
        'a0.idtoken.missing_expires_at_claim',
      );
    });

    it('fails when "exp" is not a number', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoidGhpcyBpcyBhIHN0cmluZyIsImlhdCI6MTU2NzMxNDAwMCwibm9uY2UiOiJhNTl2azU5MiIsImF6cCI6InRva2Vucy10ZXN0LTEyMyIsImF1dGhfdGltZSI6MTU2NzMxNDAwMH0.Yqj36cxYA_G7kT-uMjf_8fg-iC37E5SfskQzeLaxdErm9AG-efq6hmpN8YH1054T5a337flE7nLHmFC-Kzdf5cn4lYkTgujP3hph4WObwec95WskyyaFrm9GGdU2FjO6kT1pFy_GNW3wlmCXnyu2BRESCv_AMy7kF5Xo5hZyt1hUyW7loMxwPg2e8RficC-mm-6C70mCWSxKCSeuK088qMJDnp94iHMLfYLP38nEQmh1cxhnWgdibA9conk3SjyDTMOPtnS7tR6i6TDCky63ivvqJEdifJ7E3c2QTXoFXydfAKy7LWrCBx-iPhDyeTZQvAMz4LUzgEC1FGUDJaPqPw';

      setupSignatureMock(testJwt);

      await expect(verify(testJwt)).rejects.toHaveProperty(
        'name',
        'a0.idtoken.missing_expires_at_claim',
      );
    });

    it('fails when "exp" is in the past and outside of default leeway', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3MzE0MDAwLCJpYXQiOjE1NjczMTQwMDAsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOiJ0b2tlbnMtdGVzdC0xMjMiLCJhdXRoX3RpbWUiOjE1NjczMTQwMDB9.uDn-4wtiigGddUw2kis_QyfDE3w75rWvu9NolMgD3b7l4_fedhQOk-z_mYID588ZXpnpLRKKiD5I2IFsXl7Qcc10rx1LIZxNqdzyc3VrgFf677x7fFZ4guR2WalH-zdJEluruMRdCIFQczIjXnGKPHGQ8gPH1LRozv43dl-bO2viX6MU4pTgNq3GIsU4ureyHrx1o9JSqF4b_RzuYvVWVVX7ABC2csMJP_ocVbEIQjUBhp1V7VcQY-Zgq0prk_HvY13g8FxK4KvSza637ZWAfonn599SKuy22PeMJqDfd64SbunWrt-mKBz9PHeAo9t4LJPLsAqSd3IQ2aJTsnqJRA';

      setupSignatureMock(testJwt);

      // token exp claim of 2019-09-01T05:00:00.000Z
      const clock = new Date('2019-09-01T05:00:00.000Z');
      clock.setSeconds(clock.getSeconds() + (DEFAULT_LEEWAY + 1));

      const overrides = {
        _clock: clock,
      };

      await expect(verify(testJwt, overrides)).rejects.toHaveProperty(
        'name',
        'a0.idtoken.invalid_expires_at_claim',
      );
    });

    it('succeeds when "exp" is in the past but within the default leeway', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3MzE0MDAwLCJpYXQiOjE1NjczMTQwMDAsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOiJ0b2tlbnMtdGVzdC0xMjMiLCJhdXRoX3RpbWUiOjE1NjczMTQwMDB9.uDn-4wtiigGddUw2kis_QyfDE3w75rWvu9NolMgD3b7l4_fedhQOk-z_mYID588ZXpnpLRKKiD5I2IFsXl7Qcc10rx1LIZxNqdzyc3VrgFf677x7fFZ4guR2WalH-zdJEluruMRdCIFQczIjXnGKPHGQ8gPH1LRozv43dl-bO2viX6MU4pTgNq3GIsU4ureyHrx1o9JSqF4b_RzuYvVWVVX7ABC2csMJP_ocVbEIQjUBhp1V7VcQY-Zgq0prk_HvY13g8FxK4KvSza637ZWAfonn599SKuy22PeMJqDfd64SbunWrt-mKBz9PHeAo9t4LJPLsAqSd3IQ2aJTsnqJRA';

      setupSignatureMock(testJwt);

      // token exp claim of 2019-09-01T05:00:00.000Z
      const clock = new Date('2019-09-01T05:00:00.000Z');
      clock.setSeconds(clock.getSeconds() + (DEFAULT_LEEWAY - 1));

      const overrides = {
        _clock: clock,
      };

      await expect(verify(testJwt, overrides)).resolves.toBeUndefined();
    });

    it('fails when "exp" is in the past and outside of custom leeway', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3MzE0MDAwLCJpYXQiOjE1NjczMTQwMDAsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOiJ0b2tlbnMtdGVzdC0xMjMiLCJhdXRoX3RpbWUiOjE1NjczMTQwMDB9.uDn-4wtiigGddUw2kis_QyfDE3w75rWvu9NolMgD3b7l4_fedhQOk-z_mYID588ZXpnpLRKKiD5I2IFsXl7Qcc10rx1LIZxNqdzyc3VrgFf677x7fFZ4guR2WalH-zdJEluruMRdCIFQczIjXnGKPHGQ8gPH1LRozv43dl-bO2viX6MU4pTgNq3GIsU4ureyHrx1o9JSqF4b_RzuYvVWVVX7ABC2csMJP_ocVbEIQjUBhp1V7VcQY-Zgq0prk_HvY13g8FxK4KvSza637ZWAfonn599SKuy22PeMJqDfd64SbunWrt-mKBz9PHeAo9t4LJPLsAqSd3IQ2aJTsnqJRA';

      const leeway = 120;
      setupSignatureMock(testJwt);

      // token exp claim of 2019-09-01T05:00:00.000Z
      const clock = new Date('2019-09-01T05:00:00.000Z');
      clock.setSeconds(clock.getSeconds() + (leeway + 1));

      const overrides = {
        leeway,
        _clock: clock,
      };

      await expect(verify(testJwt, overrides)).rejects.toHaveProperty(
        'name',
        'a0.idtoken.invalid_expires_at_claim',
      );
    });

    it('succeeds when "exp" is in the past but within the custom leeway', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3MzE0MDAwLCJpYXQiOjE1NjczMTQwMDAsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOiJ0b2tlbnMtdGVzdC0xMjMiLCJhdXRoX3RpbWUiOjE1NjczMTQwMDB9.uDn-4wtiigGddUw2kis_QyfDE3w75rWvu9NolMgD3b7l4_fedhQOk-z_mYID588ZXpnpLRKKiD5I2IFsXl7Qcc10rx1LIZxNqdzyc3VrgFf677x7fFZ4guR2WalH-zdJEluruMRdCIFQczIjXnGKPHGQ8gPH1LRozv43dl-bO2viX6MU4pTgNq3GIsU4ureyHrx1o9JSqF4b_RzuYvVWVVX7ABC2csMJP_ocVbEIQjUBhp1V7VcQY-Zgq0prk_HvY13g8FxK4KvSza637ZWAfonn599SKuy22PeMJqDfd64SbunWrt-mKBz9PHeAo9t4LJPLsAqSd3IQ2aJTsnqJRA';

      const leeway = 120;

      setupSignatureMock(testJwt);

      // token exp claim of 2019-09-01T05:00:00.000Z
      const clock = new Date('2019-09-01T05:00:00.000Z');
      clock.setSeconds(clock.getSeconds() + (leeway - 1));

      const overrides = {
        leeway,
        _clock: clock,
      };

      await expect(verify(testJwt, overrides)).resolves.toBeUndefined();
    });

    it('fails when "iat" is missing', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3NDg2ODAwLCJub25jZSI6ImE1OXZrNTkyIiwiYXpwIjoidG9rZW5zLXRlc3QtMTIzIiwiYXV0aF90aW1lIjoxNTY3MzE0MDAwfQ.SJDgK8W9Y8stMtE9LG2OzHzXzbIDCXg8lRhKyOim4rRXbkg3k0on7gCzN-sy2d5z5TQ-lQzbY3V4z-so3ltVDUYd_8RjmUiKgNK_95UsxfTDM2BlBEQ6USMVl3ojC5jcTBhg5MF16ZBEn94IjIGC9Uks9GPseM-JrtUPx4Uj5VvsBtmeKxLc3rSGt7rYC4JU65Oa-O5pFYRSCbNzRFNHRlmnb5b2uPHxoVLjrJAT0FhlXcsNgfz65MlbXBgAyz7xjCEhw_tTpvptaCwPTeG0mgBYlGQ7Sl3xHJzgG4jLbA7Pvvfcx0MpBPHUZxADh1FFQnf2nHB0ppddiDfOq2mHNA';

      setupSignatureMock(testJwt);

      await expect(verify(testJwt)).rejects.toHaveProperty(
        'name',
        'a0.idtoken.missing_issued_at_claim',
      );
    });

    it('fails when "iat" is not a number', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3NDg2ODAwLCJpYXQiOiJ0aGlzIGlzIGEgc3RyaW5nIiwibm9uY2UiOiJhNTl2azU5MiIsImF6cCI6InRva2Vucy10ZXN0LTEyMyIsImF1dGhfdGltZSI6MTU2NzMxNDAwMH0.XVGkRmJU5L3behnzAII-Y4kbguVr2MF9TSdQxc_PibjxdE5VK_bhwcbo956aKbiptIq99HhoInoR6ZtF3MYNHOR0KlmxqrwmA9aBXNG8sDQu74MFFB_nqY5Ct4Ia93ZjGqlx5cRw-2k4dExw0QqbzAItOtkiZH8CgCCf4AgwOhVHqkzqcUGqh96rfnv7b8qaWi5S_lmXfMeHXFbeg7wqr1lC3p1wAg2OvON95jQrw13dMc7j6HFO95u6ICdotYROCT6ScfnYyxFmNTlGpLvudPu1dCCxd96sEL20XKpTEEnjXyk_wd5KmtzWNFYs-3aGnhIMC37KlBG8W2iysaUnbA';

      setupSignatureMock(testJwt);

      await expect(verify(testJwt)).rejects.toHaveProperty(
        'name',
        'a0.idtoken.missing_issued_at_claim',
      );
    });

    it('fails when "nonce" sent on authentication request but missing from token claims', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3NDg2ODAwLCJpYXQiOjE1NjczMTQwMDAsImF6cCI6InRva2Vucy10ZXN0LTEyMyIsImF1dGhfdGltZSI6MTU2NzMxNDAwMH0.ZRYK4s72pKXJUSadByPp_MNyuaACmPCyj9RaIfxuTTLXE45YJ0toLK6XjjDv_861E_fRmEKMthnJAmHcKXiDWGb73l3iDtD7noWBOo3KJO2cwkM1uYNpG1kbNkg6WDvgGlVsC7buxr8dbL8fI2e0g53Jl48lE9Ohi5Z_7iRmRoVAx5HE60UDfEqFeAKZyu5VsAahp9q3PwhLfaJVDobtAzWP0LcRA3x8FOA0ZdBBNpvRmeBRugU2GQTSDLSMtGzgi5xXUwXly7pr5bX-lIYICU1Q9R5n-8uYlEaFuiaYTqzxY0fmSzzGeFkwrj7b0yTQ2OwAFVT3MWCSbvjKsy-JWQ';

      setupSignatureMock(testJwt);

      await expect(verify(testJwt)).rejects.toHaveProperty(
        'name',
        'a0.idtoken.missing_nonce_claim',
      );
    });

    it('fails when "nonce" sent on authentication request but "nonce" claim is invalid', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3NDg2ODAwLCJpYXQiOjE1NjczMTQwMDAsIm5vbmNlIjoiMDAwOTk5IiwiYXpwIjoidG9rZW5zLXRlc3QtMTIzIiwiYXV0aF90aW1lIjoxNTY3MzE0MDAwfQ.n4jIX01mNucMs92F8IZtKJeCvgUYPwrrOsaZX91fnzVkDC5tAqi4HLRGHjtUJe1PwmIijJk63FskeuApVPfxfAbITL1KBVDHiin2RVeDSAl5lhSnsSYW-k5MfzXx11MJxhS_VD5zvOgbWmuRYUHlc1zh48YyJZQE-OaEFvxGyyEM7Zhgzfz4D5_kjd2qV890WsXGs_GadyzxATfP59XENnPzMo3VLXyBC4cQ0e7rzBIqquBKo9-MT6rhy_qSwMrZJhyzSzE5gTtMd2Od9YgPUtLznBt34rBD1uJaSs_a4s1Ox3h4jTCm85xWFabGx3kz7xkD33nCiMKQ_FSy1d-toQ';

      setupSignatureMock(testJwt);

      await expect(
        verify(testJwt, {
          nonce: 'nonce-on-authrequest',
        }),
      ).rejects.toHaveProperty('name', 'a0.idtoken.invalid_nonce_claim');
    });

    it('fails when "aud" is array with multiple items, and "azp" is missing', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3NDg2ODAwLCJpYXQiOjE1NjczMTQwMDAsIm5vbmNlIjoiYTU5dms1OTIiLCJhdXRoX3RpbWUiOjE1NjczMTQwMDB9.ab1cp7PTjoRNQwlJ6-ENjmFmxuoKtDHOzgB_3YiCxsIVN3WqSgv-l-AonhvnTg8qV1YXArYXlRxkE7IeXVTgB6981cHhaOywQJgZ_8NeNN7eMOyTVlcmQBP-1Ar2-Hgb8RKjNVFb-rMOGqhn2B9yu_E5amSGyPzHrATQ1wcfO-XSuzYdCbTokurEA2LsE8Sr4eMMUlRLNLjBSy-aLmIyggFOKkvw1qCiJq28tBfI24p0Al0NLfyS3EbimJIqk6JIMyOh40sdlxi9wrVt6iUjbxhN6xYA2JYBXHjMmF8l4xWPL4I4aX5g-5vpj_w10A0kepvFDhw_EbKpR-XqZ-GW3Q';

      setupSignatureMock(testJwt);

      await expect(verify(testJwt)).rejects.toHaveProperty(
        'name',
        'a0.idtoken.missing_authorized_party_claim',
      );
    });

    it('fails when "aud" is array with multiple items, and "azp" is not a string', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3NDg2ODAwLCJpYXQiOjE1NjczMTQwMDAsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOjQyLCJhdXRoX3RpbWUiOjE1NjczMTQwMDB9.SliF71jOX9JsGeUPCySf3ucY_tGr3uh183cbcUN9ze3qRiOAc5bi7vdsBtODtlVJgsx0Elt0JrISTJ8SoNkpA4SxrjFpxSsfzPBwQtJrlg7pqflgBH7g6zKGVGRs2Z0jxZaCvXQvRuUZRZwFIncZ2zTFIDI3X5xLeJAGRGWaInOvLLlumGzWzfNLUG_G5uHZQW6sRgyIw9qrdqEWXO6sGjOBG9Au6jIo2IH0I53-UujAnNHWeJRPsM5xw2bHPteIde1xn4N0w26BlZ4GEQifVQDFw3ukah35SQ-ENMMS58Siu-sysF5F3oxdwVaMidyYgrD2VUN_iXIaMPwA2i0M5Q';

      setupSignatureMock(testJwt);

      await expect(verify(testJwt)).rejects.toHaveProperty(
        'name',
        'a0.idtoken.missing_authorized_party_claim',
      );
    });

    it('fails when "aud" is array with multiple items, and "azp" does not match client ID', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3NDg2ODAwLCJpYXQiOjE1NjczMTQwMDAsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOiJleHRlcm5hbC10ZXN0LTEyMyIsImF1dGhfdGltZSI6MTU2NzMxNDAwMH0.GLuChuSum2S6h79rfRbJrJfe_7Fw_D6RHXj9zrAhixoNLMyBosO2GBPsOgoaLTDMonJzCyqskjan-w-SJ5nw7fUmDkWfPVjXcS0x5pt72j0dgfLMu6eOFIA9jWHWN4hsN3XKJktZ9202AohI8fXO5BYQ-jMi0HWQaiUj3f6wITHEN6fTydLo_t24hriExkO1670AgzM22BVTfb-JJlrs32t6ffY77zrF5ahIg_h4ROgrcf_3LejF7ZnubHbpJ-wX-byxW9YXT5tN_JjD5EP6jC37s9iL8ArGEZtBzHVfCO0kqlaH-9PVZXgz8SjMSJ8iA2fXXN0L35ySdzida3hhzw';

      setupSignatureMock(testJwt);

      await expect(verify(testJwt)).rejects.toHaveProperty(
        'name',
        'a0.idtoken.invalid_authorized_party_claim',
      );
    });

    it('fails when "max_age" was sent on the authentication request but "auth_time" is missing', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3NDg2ODAwLCJpYXQiOjE1NjczMTQwMDAsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOiJ0b2tlbnMtdGVzdC0xMjMifQ.Gb36qNHgQgac1fXh9AHX7ZMroymT0j4TjNol3ZirbIOyxuHV4OxCbGcoAAxC8Zt_dIc3DH9SX3QUIwTkE3DsFxS-VJ58R2d9RbXJl5p8pO1sJNFjo59njLKbiBxVil4z8PUsw77c_4f2QtKn6LHzhGqL9CS84LUCgNPPBsBHYyNRJDwIauPrrLyOsZAS3dWlZiUDBFurSYe0Y-O6d8zF_uKOcTD8A2E3SQQlZJQ12T94IprQ9V0tbbWI8VSGQ23JghR62QwZC-rBOF9pQMcLLCNRLFTTF9sXqZuS9XRv7PZ6rRjaonHDWn8WqGjSleWSycPsvwvjjSUVR8Z3iDBZig';

      setupSignatureMock(testJwt);

      await expect(
        verify(testJwt, {
          maxAge: 200,
        }),
      ).rejects.toHaveProperty(
        'name',
        'a0.idtoken.missing_authorization_time_claim',
      );
    });

    it('fails when "max_age" was sent on the authentication request but "auth_time" is not a number', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3NDg2ODAwLCJpYXQiOjE1NjczMTQwMDAsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOiJ0b2tlbnMtdGVzdC0xMjMiLCJhdXRoX3RpbWUiOiJ0aGlzIGlzIGEgc3RyaW5nIn0.Af6-W_IPinZ4Sy7_vJfvjez3NWKmGzCglRqYwEkkGWRXr9rJDMB7mrpba992g9cbkCVo_ywQmfHxBaxr-fss-vzMVlqfhduZM_29aGwk56thzMYPiHlcpMUxGa6lb6BrzadQEsu2WL2vstueQbvo6H4d_k-NrkYD6UN4WMjbKZaC9VE2qae_o_UAIjPCseHWW645vtQgVDDOXf8kjjmpJfQaU_ZWu2L1HMZiCbb70ndXcJ-5qj0YbJH9YrmDbYe1RwXR-GKPnTF4TYlhsYpGXMfCFTpVu_KVCSOT1U4kVeNpzoB0bBRtbfEyOaK3aSpusHJ_ECJBoAdWrdAh-k41Jg';

      setupSignatureMock(testJwt);

      await expect(
        verify(testJwt, {
          maxAge: 200,
        }),
      ).rejects.toHaveProperty(
        'name',
        'a0.idtoken.missing_authorization_time_claim',
      );
    });

    it('fails when "max_age" was sent on the authentication request but "auth_time" is outside of default leeway', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3NDg2ODAwLCJpYXQiOjE1NjczMTQwMDAsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOiJ0b2tlbnMtdGVzdC0xMjMiLCJhdXRoX3RpbWUiOjE1NjczMTQwMDB9.AbSYZ_Tu0-ZelCRPuu9jOd9y1M19yIlk8bjSQDVVgAekRZLdRA_T_gi_JeWyFysKZVpRcHC1YJhTH4YH8CCMRTwviq3woIsLmdUecjydyZkHcUlhHXj2DbC15cyELalPNe3T9eZ4ySwk9qRJSOkjBAgXAT0a7M6rwri6QHnL0WxTLX4us4rGu8Ui3kuf1WaZH9DNoeWYs1N3xUnOwTkRKaqXnuKjnwSVmsuwxFSlnIPJOiMUUZksiaBq_OUvOkB-dEG7OFiDX9XWj1m62yBHkvZHun8LBr9VW3mt1IrcBdbbtzjWwfn6ioK2c4dbtPFhuYohXsmRDaSekP63Dmlw3A';

      setupSignatureMock(testJwt);

      const maxAge = 120;
      // token auth_time claim of 2019-09-01T05:00:00.000Z
      const clock = new Date('2019-09-01T05:00:00.000Z');
      clock.setSeconds(clock.getSeconds() + maxAge + (DEFAULT_LEEWAY + 1));

      await expect(
        verify(testJwt, {
          maxAge,
          _clock: clock,
        }),
      ).rejects.toHaveProperty(
        'name',
        'a0.idtoken.invalid_authorization_time_claim',
      );
    });

    it('succeeds when "max_age" was sent on the authentication request and "auth_time" is within default leeway', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3NDg2ODAwLCJpYXQiOjE1NjczMTQwMDAsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOiJ0b2tlbnMtdGVzdC0xMjMiLCJhdXRoX3RpbWUiOjE1NjczMTQwMDB9.AbSYZ_Tu0-ZelCRPuu9jOd9y1M19yIlk8bjSQDVVgAekRZLdRA_T_gi_JeWyFysKZVpRcHC1YJhTH4YH8CCMRTwviq3woIsLmdUecjydyZkHcUlhHXj2DbC15cyELalPNe3T9eZ4ySwk9qRJSOkjBAgXAT0a7M6rwri6QHnL0WxTLX4us4rGu8Ui3kuf1WaZH9DNoeWYs1N3xUnOwTkRKaqXnuKjnwSVmsuwxFSlnIPJOiMUUZksiaBq_OUvOkB-dEG7OFiDX9XWj1m62yBHkvZHun8LBr9VW3mt1IrcBdbbtzjWwfn6ioK2c4dbtPFhuYohXsmRDaSekP63Dmlw3A';

      setupSignatureMock(testJwt);

      const maxAge = 120;
      // token auth_time claim of 2019-09-01T05:00:00.000Z
      const clock = new Date('2019-09-01T05:00:00.000Z');
      clock.setSeconds(clock.getSeconds() + maxAge + (DEFAULT_LEEWAY - 1));

      await expect(
        verify(testJwt, {
          maxAge,
          _clock: clock,
        }),
      ).resolves.toBeUndefined();
    });

    it('fails when "max_age" was sent on the authentication request but "auth_time" is outside of custom leeway', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3NDg2ODAwLCJpYXQiOjE1NjczMTQwMDAsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOiJ0b2tlbnMtdGVzdC0xMjMiLCJhdXRoX3RpbWUiOjE1NjczMTQwMDB9.AbSYZ_Tu0-ZelCRPuu9jOd9y1M19yIlk8bjSQDVVgAekRZLdRA_T_gi_JeWyFysKZVpRcHC1YJhTH4YH8CCMRTwviq3woIsLmdUecjydyZkHcUlhHXj2DbC15cyELalPNe3T9eZ4ySwk9qRJSOkjBAgXAT0a7M6rwri6QHnL0WxTLX4us4rGu8Ui3kuf1WaZH9DNoeWYs1N3xUnOwTkRKaqXnuKjnwSVmsuwxFSlnIPJOiMUUZksiaBq_OUvOkB-dEG7OFiDX9XWj1m62yBHkvZHun8LBr9VW3mt1IrcBdbbtzjWwfn6ioK2c4dbtPFhuYohXsmRDaSekP63Dmlw3A';

      setupSignatureMock(testJwt);

      const maxAge = 120;
      const leeway = 15;

      // token auth_time claim of 2019-09-01T05:00:00.000Z
      const clock = new Date('2019-09-01T05:00:00.000Z');
      clock.setSeconds(clock.getSeconds() + maxAge + (leeway + 1));

      await expect(
        verify(testJwt, {
          maxAge,
          _clock: clock,
          leeway,
        }),
      ).rejects.toHaveProperty(
        'name',
        'a0.idtoken.invalid_authorization_time_claim',
      );
    });

    it('succeeds when "max_age" was sent on the authentication request and "auth_time" is within custom leeway', async () => {
      const testJwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2Vucy10ZXN0LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3ODkiLCJhdWQiOlsidG9rZW5zLXRlc3QtMTIzIiwiZXh0ZXJuYWwtdGVzdC0xMjMiXSwiZXhwIjoxNTY3NDg2ODAwLCJpYXQiOjE1NjczMTQwMDAsIm5vbmNlIjoiYTU5dms1OTIiLCJhenAiOiJ0b2tlbnMtdGVzdC0xMjMiLCJhdXRoX3RpbWUiOjE1NjczMTQwMDB9.AbSYZ_Tu0-ZelCRPuu9jOd9y1M19yIlk8bjSQDVVgAekRZLdRA_T_gi_JeWyFysKZVpRcHC1YJhTH4YH8CCMRTwviq3woIsLmdUecjydyZkHcUlhHXj2DbC15cyELalPNe3T9eZ4ySwk9qRJSOkjBAgXAT0a7M6rwri6QHnL0WxTLX4us4rGu8Ui3kuf1WaZH9DNoeWYs1N3xUnOwTkRKaqXnuKjnwSVmsuwxFSlnIPJOiMUUZksiaBq_OUvOkB-dEG7OFiDX9XWj1m62yBHkvZHun8LBr9VW3mt1IrcBdbbtzjWwfn6ioK2c4dbtPFhuYohXsmRDaSekP63Dmlw3A';

      setupSignatureMock(testJwt);

      const maxAge = 120;
      const leeway = 15;

      // token auth_time claim of 2019-09-01T05:00:00.000Z
      const clock = new Date('2019-09-01T05:00:00.000Z');
      clock.setSeconds(clock.getSeconds() + maxAge + (leeway - 1));

      await expect(
        verify(testJwt, {
          maxAge,
          _clock: clock,
          leeway,
        }),
      ).resolves.toBeUndefined();
    });

    it('succeeds with valid token claims using default clock', async () => {
      const yesterday = Math.round(Date.now() / 1000 - 3600 * 24);
      const tomorrow = Math.round(Date.now() / 1000 + 3600 * 24);

      const decodedJwt = {
        iss: `https://${BASE_EXPECTATIONS.domain}/`,
        sub: 'auth0|123456789',
        aud: BASE_EXPECTATIONS.clientId,
        exp: tomorrow,
        iat: yesterday,
        nonce: BASE_EXPECTATIONS.nonce,
      };

      sigMock.mockImplementation(() => Promise.resolve(decodedJwt));

      await expect(
        verify('jwt-string-mocked', {
          _clock: undefined,
        }),
      ).resolves.toBeUndefined();
    });

    const setupSignatureMock = jwt => {
      sigMock.mockImplementation(() => Promise.resolve(jwtDecoder(jwt)));
    };
  });

  const BASE_EXPECTATIONS = {
    clientId: 'tokens-test-123',
    clientIdAlt: 'external-test-123',
    domain: 'tokens-test.auth0.com',
    issuer: 'https://tokens-test.auth0.com/',
    nonce: 'a59vk592',
  };

  const verify = (idToken, optionsOverrides = {}) => {
    const optionsDefaults = {
      domain: BASE_EXPECTATIONS.domain,
      clientId: BASE_EXPECTATIONS.clientId,
      scope: 'openid profile email',
      nonce: BASE_EXPECTATIONS.nonce,
      _clock: new Date('2019-09-02T05:00:00.000Z'),
    };

    const options = Object.assign({}, optionsDefaults, optionsOverrides);
    return verifyToken(idToken, options);
  };

  const setupFetchMock = ({
    domain = BASE_EXPECTATIONS.domain,
    jwks = getExpectedJwks(),
  } = {}) => {
    const expectedDiscoveryUri = `https://${domain}/.well-known/openid-configuration`;
    const expectedJwksUri = `https://${domain}/.well-known/jwks.json`;

    fetchMock.get(expectedDiscoveryUri, {jwks_uri: expectedJwksUri});
    fetchMock.get(expectedJwksUri, jwks);
  };

  const getExpectedJwks = () => {
    return JSON.parse(
      fs.readFileSync(path.resolve(__dirname, './jwks.json'), 'utf8'),
    );
  };
});
