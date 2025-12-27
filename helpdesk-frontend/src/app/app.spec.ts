import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { AuthService } from './core/services/auth';

describe('App', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    // Simulamos que no está logueado por defecto
    mockAuthService.isLoggedIn.and.returnValue(false);
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();
  });

  it('should render navbar or main container', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    // Ajusta este selector a algo que realmente tengas en tu HTML (ej. <nav> o .container) [cite: 18, 19]
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
