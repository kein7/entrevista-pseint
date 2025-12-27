import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TicketDetailModal } from './ticket-detail-modal';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('TicketDetailModal', () => {
  let component: TicketDetailModal;
  let fixture: ComponentFixture<TicketDetailModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketDetailModal],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketDetailModal);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // Seteamos el valor del input signal manualmente
    fixture.componentRef.setInput('ticket', {
      id: 1,
      title: 'Test Ticket',
      description: 'Desc',
      priority: 1,
      status: 0,
    });

    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
