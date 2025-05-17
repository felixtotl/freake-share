import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lzyexphsxmuzckrometh.supabase.co'; // aus dem Dashboard kopieren
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6eWV4cGhzeG11emNrcm9tZXRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NTM4OTEsImV4cCI6MjA2MzAyOTg5MX0.GgOModasgQn3-uyTMu438CN00EScYBAiuFAXlPu5-hQ';         // auch aus dem Dashboard

export const supabase = createClient(supabaseUrl, supabaseKey);