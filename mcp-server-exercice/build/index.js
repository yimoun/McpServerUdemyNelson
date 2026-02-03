#!/usr/bin/env node
/**
 * Serveur MCP avec Outils Utilitaires
 * Exercice de fin de tutoriel
 *
 * Tools inclus:
 * 1. generate-password: Génère des mots de passe sécurisés
 * 2. validate-email: Valide une adresse email
 * 3. shorten-url: Génère une URL raccourcie
 * 4. get-system-info: Récupère les informations système
 * 5. generate-uuid: Génère un UUID v4
 * 6. encode-base64: Encode/Décode en base64
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import os from "os";
import crypto from "crypto";
// Stockage en mémoire pour les URLs raccourcies
const urlDatabase = new Map();
class UtilityMCPServer {
    server;
    constructor() {
        this.server = new Server({
            name: "mcp-server-exercice",
            version: "1.0.0",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        // Gestion des erreurs
        this.server.onerror = (error) => console.error("[MCP Error]", error);
        process.on("SIGINT", async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        // Liste des tools disponibles
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "generate-password",
                    description: "Génère un mot de passe sécurisé avec différentes options (longueur, caractères spéciaux, chiffres, majuscules)",
                    inputSchema: {
                        type: "object",
                        properties: {
                            length: {
                                type: "number",
                                description: "Longueur du mot de passe (entre 8 et 128)",
                                minimum: 8,
                                maximum: 128,
                                default: 16,
                            },
                            includeNumbers: {
                                type: "boolean",
                                description: "Inclure des chiffres",
                                default: true,
                            },
                            includeSymbols: {
                                type: "boolean",
                                description: "Inclure des caractères spéciaux",
                                default: true,
                            },
                            includeUppercase: {
                                type: "boolean",
                                description: "Inclure des majuscules",
                                default: true,
                            },
                            includeLowercase: {
                                type: "boolean",
                                description: "Inclure des minuscules",
                                default: true,
                            },
                        },
                    },
                },
                {
                    name: "validate-email",
                    description: "Valide une adresse email et retourne si elle est correcte ou non",
                    inputSchema: {
                        type: "object",
                        properties: {
                            email: {
                                type: "string",
                                description: "L'adresse email à valider",
                            },
                        },
                        required: ["email"],
                    },
                },
                {
                    name: "shorten-url",
                    description: "Génère une URL raccourcie pour une URL longue",
                    inputSchema: {
                        type: "object",
                        properties: {
                            url: {
                                type: "string",
                                description: "L'URL à raccourcir",
                            },
                            customCode: {
                                type: "string",
                                description: "Code personnalisé optionnel (4-10 caractères)",
                            },
                        },
                        required: ["url"],
                    },
                },
                {
                    name: "get-url",
                    description: "Récupère l'URL originale depuis un code raccourci",
                    inputSchema: {
                        type: "object",
                        properties: {
                            code: {
                                type: "string",
                                description: "Le code de l'URL raccourcie",
                            },
                        },
                        required: ["code"],
                    },
                },
                {
                    name: "get-system-info",
                    description: "Récupère les informations du système (OS, CPU, mémoire, etc.)",
                    inputSchema: {
                        type: "object",
                        properties: {
                            detailed: {
                                type: "boolean",
                                description: "Retourner des informations détaillées",
                                default: false,
                            },
                        },
                    },
                },
                {
                    name: "generate-uuid",
                    description: "Génère un UUID v4 unique",
                    inputSchema: {
                        type: "object",
                        properties: {
                            count: {
                                type: "number",
                                description: "Nombre d'UUIDs à générer",
                                minimum: 1,
                                maximum: 100,
                                default: 1,
                            },
                        },
                    },
                },
                {
                    name: "base64-encode",
                    description: "Encode une chaîne de caractères en base64",
                    inputSchema: {
                        type: "object",
                        properties: {
                            text: {
                                type: "string",
                                description: "Le texte à encoder",
                            },
                        },
                        required: ["text"],
                    },
                },
                {
                    name: "base64-decode",
                    description: "Décode une chaîne base64 en texte",
                    inputSchema: {
                        type: "object",
                        properties: {
                            encoded: {
                                type: "string",
                                description: "Le texte en base64 à décoder",
                            },
                        },
                        required: ["encoded"],
                    },
                },
            ],
        }));
        // Gestion des appels d'outils
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case "generate-password":
                        return this.generatePassword(args);
                    case "validate-email":
                        return this.validateEmail(args);
                    case "shorten-url":
                        return this.shortenUrl(args);
                    case "get-url":
                        return this.getUrl(args);
                    case "get-system-info":
                        return this.getSystemInfo(args);
                    case "generate-uuid":
                        return this.generateUUID(args);
                    case "base64-encode":
                        return this.base64Encode(args);
                    case "base64-decode":
                        return this.base64Decode(args);
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${error.message}`,
                        },
                    ],
                };
            }
        });
    }
    // Tool: Générer un mot de passe
    generatePassword(args) {
        const { length = 16, includeNumbers = true, includeSymbols = true, includeUppercase = true, includeLowercase = true, } = args;
        let charset = "";
        if (includeLowercase)
            charset += "abcdefghijklmnopqrstuvwxyz";
        if (includeUppercase)
            charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (includeNumbers)
            charset += "0123456789";
        if (includeSymbols)
            charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
        if (charset.length === 0) {
            throw new Error("Au moins un type de caractère doit être sélectionné");
        }
        let password = "";
        const randomBytes = crypto.randomBytes(length);
        for (let i = 0; i < length; i++) {
            password += charset[randomBytes[i] % charset.length];
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        password,
                        length,
                        strength: this.calculatePasswordStrength(password),
                    }, null, 2),
                },
            ],
        };
    }
    // Calculer la force du mot de passe
    calculatePasswordStrength(password) {
        let score = 0;
        if (password.length >= 12)
            score++;
        if (password.length >= 16)
            score++;
        if (/[a-z]/.test(password))
            score++;
        if (/[A-Z]/.test(password))
            score++;
        if (/[0-9]/.test(password))
            score++;
        if (/[^a-zA-Z0-9]/.test(password))
            score++;
        if (score <= 2)
            return "Faible";
        if (score <= 4)
            return "Moyen";
        return "Fort";
    }
    // Tool: Valider un email
    validateEmail(args) {
        const { email } = args;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        // Vérifications supplémentaires
        const validations = {
            format: emailRegex.test(email),
            hasAt: email.includes("@"),
            hasDomain: email.split("@")[1]?.includes("."),
            noSpaces: !email.includes(" "),
            validLength: email.length >= 5 && email.length <= 254,
        };
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        email,
                        isValid,
                        validations,
                        message: isValid ? "Email valide ✓" : "Email invalide ✗",
                    }, null, 2),
                },
            ],
        };
    }
    // Tool: Raccourcir une URL
    shortenUrl(args) {
        const { url, customCode } = args;
        // Valider l'URL
        try {
            new URL(url);
        }
        catch {
            throw new Error("URL invalide");
        }
        let code;
        if (customCode) {
            if (customCode.length < 4 || customCode.length > 10) {
                throw new Error("Le code personnalisé doit faire entre 4 et 10 caractères");
            }
            if (urlDatabase.has(customCode)) {
                throw new Error("Ce code est déjà utilisé");
            }
            code = customCode;
        }
        else {
            // Générer un code aléatoire de 6 caractères
            code = crypto.randomBytes(3).toString("hex");
        }
        urlDatabase.set(code, url);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        originalUrl: url,
                        shortCode: code,
                        shortUrl: `https://short.url/${code}`,
                        message: "URL raccourcie avec succès!",
                        totalUrls: urlDatabase.size,
                    }, null, 2),
                },
            ],
        };
    }
    // Tool: Récupérer une URL depuis le code
    getUrl(args) {
        const { code } = args;
        const url = urlDatabase.get(code);
        if (!url) {
            throw new Error("Code introuvable");
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        code,
                        originalUrl: url,
                        message: "URL trouvée!",
                    }, null, 2),
                },
            ],
        };
    }
    // Tool: Informations système
    getSystemInfo(args) {
        const { detailed = false } = args;
        const basicInfo = {
            platform: os.platform(),
            architecture: os.arch(),
            hostname: os.hostname(),
            totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
            freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
            cpuCount: os.cpus().length,
            uptime: `${(os.uptime() / 3600).toFixed(2)} heures`,
            nodeVersion: process.version,
        };
        if (detailed) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            ...basicInfo,
                            cpus: os.cpus().map((cpu) => ({
                                model: cpu.model,
                                speed: `${cpu.speed} MHz`,
                            })),
                            networkInterfaces: os.networkInterfaces(),
                            homeDir: os.homedir(),
                            tempDir: os.tmpdir(),
                            userInfo: os.userInfo(),
                        }, null, 2),
                    },
                ],
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(basicInfo, null, 2),
                },
            ],
        };
    }
    // Tool: Générer des UUIDs
    generateUUID(args) {
        const { count = 1 } = args;
        const uuids = [];
        for (let i = 0; i < count; i++) {
            uuids.push(crypto.randomUUID());
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        uuids,
                        count: uuids.length,
                    }, null, 2),
                },
            ],
        };
    }
    // Tool: Encoder en base64
    base64Encode(args) {
        const { text } = args;
        const encoded = Buffer.from(text, "utf-8").toString("base64");
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        original: text,
                        encoded,
                        length: encoded.length,
                    }, null, 2),
                },
            ],
        };
    }
    // Tool: Décoder depuis base64
    base64Decode(args) {
        const { encoded } = args;
        try {
            const decoded = Buffer.from(encoded, "base64").toString("utf-8");
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            encoded,
                            decoded,
                            length: decoded.length,
                        }, null, 2),
                    },
                ],
            };
        }
        catch {
            throw new Error("Chaîne base64 invalide");
        }
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("MCP Utility Server running on stdio");
    }
}
// Démarrage du serveur
const server = new UtilityMCPServer();
server.run().catch(console.error);
